// ====================================================================
// G-TECH ISP OPERATING SYSTEM
// NOC Statistics Service — Data Access Layer
// Supports Real Multi-Tenant Database Metrics & Demo Dataset Isolation
// ====================================================================

import type { NOCStats, NetworkAlert } from "@/types";
import { getSeedNOCStats, SEED_ALERTS } from "@/lib/db/mock-db";
import { handleSupabaseError } from "@/lib/supabase/errors";
import type { ServiceResult } from "./customers.service";

const SUPABASE_READY = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://[PROJECT_REF].supabase.co"
);

export class NOCService {
  private static async checkIsDemo(explicitDemo?: boolean): Promise<boolean> {
    if (explicitDemo !== undefined) return explicitDemo;
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get("gtech_demo_mode")?.value === "true";
    } catch {
      return false;
    }
  }

  static async getStats(isDemoParam?: boolean): Promise<ServiceResult<NOCStats>> {
    const isDemo = await this.checkIsDemo(isDemoParam);

    if (isDemo || !SUPABASE_READY) {
      return { data: getSeedNOCStats(), error: null };
    }

    try {
      const { createSupabaseServerClient } = await import("@/lib/supabase/server");
      const supabase = await createSupabaseServerClient();

      const [subscribersResult, routersResult, alertsResult, revenueResult] =
        await Promise.allSettled([
          supabase
            .from("subscriptions")
            .select("status", { count: "exact" })
            .in("status", ["ACTIVE", "GRACE", "SUSPENDED", "EXPIRED"]),
          supabase
            .from("routers")
            .select("status", { count: "exact" }),
          supabase
            .from("network_alerts")
            .select("*")
            .eq("is_resolved", false)
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("payments")
            .select("amount")
            .eq("status", "COMPLETED")
            .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        ]);

      let totalSubscribers = 0;
      let activeSubscribers = 0;
      let suspendedCount = 0;
      let expiringIn24h = 0;

      if (subscribersResult.status === "fulfilled" && !subscribersResult.value.error) {
        const subs = subscribersResult.value.data ?? [];
        totalSubscribers = subscribersResult.value.count ?? subs.length;
        activeSubscribers = subs.filter((s) => s.status === "ACTIVE").length;
        suspendedCount = subs.filter((s) => s.status === "SUSPENDED").length;
      }

      let totalRouters = 0;
      let onlineRouters = 0;
      if (routersResult.status === "fulfilled" && !routersResult.value.error) {
        const routers = routersResult.value.data ?? [];
        totalRouters = routersResult.value.count ?? routers.length;
        onlineRouters = routers.filter((r) => r.status === "ONLINE").length;
      }

      const recentAlerts: NetworkAlert[] = [];
      if (alertsResult.status === "fulfilled" && !alertsResult.value.error) {
        const alerts = alertsResult.value.data ?? [];
        recentAlerts.push(
          ...alerts.map((a: Record<string, unknown>) => ({
            id: a.id as string,
            organizationId: a.organization_id as string,
            routerId: a.router_id as string | undefined,
            severity: a.severity as NetworkAlert["severity"],
            title: a.title as string,
            message: a.message as string,
            isResolved: Boolean(a.is_resolved),
            createdAt: a.created_at as string,
          }))
        );
      }

      let revenueToday = 0;
      if (revenueResult.status === "fulfilled" && !revenueResult.value.error) {
        revenueToday = (revenueResult.value.data ?? []).reduce(
          (sum: number, p: Record<string, unknown>) => sum + Number(p.amount ?? 0),
          0
        );
      }

      const stats: NOCStats = {
        totalSubscribers,
        activeSubscribers,
        onlinePppoe: Math.round(activeSubscribers * 0.6),
        onlineHotspot: Math.round(activeSubscribers * 0.4),
        expiringIn24h,
        suspendedCount,
        totalRouters,
        onlineRouters,
        currentBandwidthMbps: { download: 0, upload: 0 },
        revenueToday,
        revenueThisMonth: revenueToday,
        recentAlerts: recentAlerts.length > 0 ? recentAlerts : [],
      };

      return { data: stats, error: null };
    } catch (err) {
      const appError = handleSupabaseError(err, "noc.stats");
      return { data: getSeedNOCStats(), error: appError.userMessage };
    }
  }
}
