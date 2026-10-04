import { NextRequest, NextResponse } from "next/server";
import { SEED_ORGANIZATION, SEED_PLANS } from "@/lib/db/mock-db";
import {
  getDefaultPortalConfig,
  resolveTenantKey,
  sanitizePortalConfig,
  AUTH_METHOD_REGISTRY,
} from "@/lib/captive/config";
import {
  PLAN_COLUMNS,
  SUPABASE_READY,
  assetValidatorFor,
  jsonError,
  mapPlanRows,
  type AnyClient,
} from "@/lib/captive/server";

export const dynamic = "force-dynamic";

const CACHE = { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" };

/**
 * PUBLIC captive-portal resolution (no login — hotspot clients are anonymous).
 *
 * Tenant resolution order:
 *   1. ?org=<organization slug>   (what the MikroTik hotspot login redirect carries)
 *   2. Host header matching a published custom domain  (future: wifi.exampleisp.co.ke)
 *
 * Returns ONLY the published, validated design + that tenant's active hotspot
 * packages. No ids of other tenants, no credentials, no drafts.
 * ?preview=draft is NOT handled here — drafts are served only by the
 * authenticated /api/v1/captive/config route.
 */
export async function GET(req: NextRequest) {
  const key = resolveTenantKey({
    org: req.nextUrl.searchParams.get("org"),
    host: req.headers.get("x-forwarded-host") ?? req.headers.get("host"),
    platformHosts: [process.env.NEXT_PUBLIC_APP_HOST ?? ""].filter(Boolean),
  });

  // Local / unconfigured backend: serve the seeded demo tenant exactly as before.
  if (!SUPABASE_READY) {
    return NextResponse.json(
      {
        success: true,
        data: {
          organization: { name: SEED_ORGANIZATION.name, slug: SEED_ORGANIZATION.slug },
          config: getDefaultPortalConfig(SEED_ORGANIZATION.name),
          plans: SEED_PLANS.filter((p) => p.serviceType === "HOTSPOT"),
          methods: AUTH_METHOD_REGISTRY.filter((m) => m.supported).map((m) => m.id),
          published: false,
        },
      },
      { headers: CACHE }
    );
  }

  if (!key) {
    return jsonError(404, "PORTAL_NOT_FOUND", "This WiFi portal could not be found. Please scan the QR code or reconnect to the network.");
  }

  try {
    const { createSupabaseServiceClient } = await import("@/lib/supabase/server");
    const db = createSupabaseServiceClient() as unknown as AnyClient;

    let orgId: string | null = null;
    let orgName = "";
    let orgSlug = "";

    if (key.type === "slug") {
      const { data } = await db
        .from("organizations")
        .select("id, name, slug")
        .eq("slug", key.value)
        .eq("is_active", true)
        .maybeSingle();
      if (data) ({ id: orgId, name: orgName, slug: orgSlug } = data as { id: string; name: string; slug: string });
    } else {
      const { data: dom } = await db
        .from("captive_portal_configs")
        .select("organization_id")
        .eq("status", "PUBLISHED")
        .ilike("custom_domain", key.value)
        .maybeSingle();
      if (dom) {
        const { data } = await db
          .from("organizations")
          .select("id, name, slug")
          .eq("id", (dom as { organization_id: string }).organization_id)
          .eq("is_active", true)
          .maybeSingle();
        if (data) ({ id: orgId, name: orgName, slug: orgSlug } = data as { id: string; name: string; slug: string });
      }
    }

    if (!orgId) {
      return jsonError(404, "PORTAL_NOT_FOUND", "This WiFi portal could not be found. Please scan the QR code or reconnect to the network.");
    }

    const [{ data: pub }, { data: planRows }] = await Promise.all([
      db
        .from("captive_portal_configs")
        .select("config")
        .eq("organization_id", orgId)
        .eq("status", "PUBLISHED")
        .maybeSingle(),
      db
        .from("plans")
        .select(PLAN_COLUMNS)
        .eq("organization_id", orgId)
        .eq("service_type", "HOTSPOT")
        .eq("is_active", true)
        .order("price", { ascending: true }),
    ]);

    const plans = mapPlanRows(planRows as Array<Record<string, unknown>> | null);
    const config = pub
      ? sanitizePortalConfig((pub as { config: unknown }).config, {
          isAllowedAssetUrl: assetValidatorFor(orgId),
          validPlanIds: new Set(plans.map((p) => p.id)),
          businessNameFallback: orgName,
        }).config
      : getDefaultPortalConfig(orgName);

    return NextResponse.json(
      {
        success: true,
        data: {
          organization: { name: orgName, slug: orgSlug },
          config,
          plans,
          methods: AUTH_METHOD_REGISTRY.filter((m) => m.supported).map((m) => m.id),
          published: Boolean(pub),
        },
      },
      { headers: CACHE }
    );
  } catch (err) {
    console.error("[CaptivePortal] public resolve failed:", err);
    return jsonError(503, "PORTAL_UNAVAILABLE", "The WiFi portal is temporarily unavailable. Please try again.");
  }
}
