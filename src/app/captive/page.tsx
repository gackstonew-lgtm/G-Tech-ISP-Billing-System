"use client";
import React, { useEffect, useState } from "react";
import { Wifi } from "lucide-react";
import { PortalRenderer } from "@/components/captive/PortalRenderer";
import { getDefaultPortalConfig, type PlanLike, type PortalConfig } from "@/lib/captive/config";

interface PortalPayload {
  config: PortalConfig;
  plans: PlanLike[];
  methods: string[];
  organizationName: string;
  isDraftPreview: boolean;
}

/**
 * Public hotspot captive portal.
 *   /captive?org=<slug>          → that ISP's PUBLISHED design
 *   /captive?org=<slug>&preview=draft → the signed-in admin's own DRAFT ("Test" step)
 * Without ?org the host header is used (future custom domains).
 */
export default function CaptivePortalPage() {
  const [data, setData] = useState<PortalPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams(window.location.search);
    const org = params.get("org");
    const wantsDraft = params.get("preview") === "draft";

    (async () => {
      try {
        if (wantsDraft) {
          const res = await fetch("/api/v1/captive/config", { signal: ctrl.signal, cache: "no-store" });
          const json = await res.json();
          if (json?.success) {
            setData({
              config: json.data.draft ?? getDefaultPortalConfig(json.data.organization?.name),
              plans: json.data.plans ?? [],
              methods: ["voucher", "mpesa"],
              organizationName: json.data.organization?.name ?? "",
              isDraftPreview: true,
            });
            return;
          }
          setError("Sign in as an administrator to preview your draft.");
          return;
        }
        const res = await fetch(`/api/v1/captive/public${org ? `?org=${encodeURIComponent(org)}` : ""}`, {
          signal: ctrl.signal,
        });
        const json = await res.json();
        if (!json?.success) {
          setError(json?.message ?? "This WiFi portal is unavailable.");
          return;
        }
        setData({
          config: json.data.config,
          plans: json.data.plans,
          methods: json.data.methods,
          organizationName: json.data.organization?.name ?? "",
          isDraftPreview: false,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("The WiFi portal could not be loaded. Please try again.");
      }
    })();
    return () => ctrl.abort();
  }, []);

  // Tab title + favicon from the ISP's own branding.
  useEffect(() => {
    if (!data) return;
    const prevTitle = document.title;
    document.title = `${data.config.branding.businessName} — WiFi`;
    let link: HTMLLinkElement | null = null;
    let prevHref: string | null = null;
    if (data.config.branding.faviconUrl) {
      link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      prevHref = link.href;
      link.href = data.config.branding.faviconUrl;
    }
    return () => {
      document.title = prevTitle;
      if (link && prevHref) link.href = prevHref;
    };
  }, [data]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div role="alert" className="max-w-sm space-y-3 text-center">
          <Wifi className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-lg font-semibold">WiFi portal unavailable</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading WiFi portal">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {data.isDraftPreview && (
        <div role="status" className="bg-warning-soft px-4 py-2 text-center text-xs font-semibold text-warning">
          Draft preview — this design is not live yet. Publish it from Settings → Captive Portal Designer.
        </div>
      )}
      <PortalRenderer
        config={data.config}
        plans={data.plans}
        supportedMethods={data.methods}
        mode="live"
        className="flex-1"
      />
    </div>
  );
}
