"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Router as RouterIcon,
  Plus,
  Activity,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Server,
  X,
  Sparkles,
} from "lucide-react";
import { SEED_ROUTERS, SEED_ORGANIZATION } from "@/lib/db/mock-db";
import { Router } from "@/types";
import { RouterScriptGenerator } from "@/lib/network/script-generator";
import { MikroTikService } from "@/lib/network/mikrotik";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { useAuth } from "@/lib/auth/auth-context";

export default function RoutersPage() {
  const { isDemoMode, user, organization } = useAuth();

  const [routers, setRouters] = useState<Router[]>(SEED_ROUTERS);
  const [selectedRouterForScript, setSelectedRouterForScript] = useState<Router | null>(null);
  const [copied, setCopied] = useState(false);
  const [testingRouterId, setTestingRouterId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { latency: number; msg: string }>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchRouters = async () => {
    if (isDemoMode) {
      setRouters(SEED_ROUTERS);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/mikrotik-fleet");
      const data = await res.json();
      if (data?.success && data.data) {
        setRouters(data.data);
      }
    } catch (err) {
      console.error("[Routers] Failed to fetch routers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRouters();
  }, [isDemoMode, user?.id]);

  const handleTestConnection = async (router: Router) => {
    setTestingRouterId(router.id);
    const res = await MikroTikService.testConnection(router);
    setTestingRouterId(null);
    setTestResults((prev) => ({
      ...prev,
      [router.id]: { latency: res.latencyMs, msg: res.message },
    }));
  };

  const activeScript = selectedRouterForScript
    ? RouterScriptGenerator.generateScript({
        routerName: selectedRouterForScript.name,
        orgName: organization?.name || SEED_ORGANIZATION.name,
        orgSlug: organization?.slug || SEED_ORGANIZATION.slug,
        orgId: organization?.id || SEED_ORGANIZATION.id,
        routerOsVersion: "v7",
        managementTunnelIp: selectedRouterForScript.wireguardTunnelIp || "10.200.1.2",
        saasGatewayHost: "vpn.gtechisp.co.ke",
        saasGatewayPort: 51820,
        saasPublicKey: "aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890=",
        routerPrivateKey: "sEcReT_rOuTeR_pRiVaTe_kEy_8912==",
        radiusSecret: "GtechRadiusSecret2025!",
        radiusAuthPort: 1812,
        radiusAcctPort: 1813,
        hotspotDnsName: "wifi.gtech.local",
      })
    : "";

  const handleCopyScript = () => {
    navigator.clipboard.writeText(activeScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell title="MikroTik Fleet & Auto-Provisioning">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            MikroTik RouterOS Fleet
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            WireGuard encrypted tunnels, FreeRADIUS AAA integration, and Zero-Touch script generation
          </p>
        </div>
        <button
          onClick={() => {
            if (routers.length > 0) setSelectedRouterForScript(routers[0]);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-brand-btn transition shrink-0"
        >
          <Terminal className="w-4 h-4" />
          <span>Generate RouterOS .rsc Script</span>
        </button>
      </div>

      {/* Router Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routers.length === 0 ? (
          <div className="col-span-full p-8 text-center space-y-3 bg-surface border border-dashed border-border rounded-2xl">
            <RouterIcon className="w-8 h-8 text-muted-foreground mx-auto" />
            <div className="text-sm font-bold text-foreground">No MikroTik Routers Configured</div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your organization currently has no registered MikroTik routers. Click below to generate an auto-configuration script for your first device.
            </p>
          </div>
        ) : (
          routers.map((router) => {
            const result = testResults[router.id];
            const isTesting = testingRouterId === router.id;
            return (
              <GlassCard key={router.id} hoverEffect>
                <GlassCardHeader>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <h3 className="text-sm font-bold text-foreground truncate">{router.name}</h3>
                  </div>
                  <GlassBadge variant="success" size="sm">
                    {router.status}
                  </GlassBadge>
                </GlassCardHeader>

                <GlassCardContent className="space-y-4">
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Model:</span>
                      <span className="text-foreground font-bold">{router.boardModel || "MikroTik CCR"}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>RouterOS:</span>
                      <span className="text-foreground font-bold">{router.routerosVersion || "v7"}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>WireGuard Tunnel:</span>
                      <span className="text-primary font-bold">{router.wireguardTunnelIp || router.managementIp}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>API Port:</span>
                      <span className="text-foreground">{router.apiPort}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-elevated/60 border border-border text-center font-mono">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-sans">CPU</div>
                      <div className="text-sm font-extrabold text-foreground">{router.cpuLoad}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-sans">RAM Free</div>
                      <div className="text-sm font-extrabold text-foreground">{router.freeMemoryMb} MB</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-sans">Sessions</div>
                      <div className="text-sm font-extrabold text-emerald-500">{router.activeSessions || 0}</div>
                    </div>
                  </div>

                  {result && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-mono border ${
                        result.latency >= 0
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}
                    >
                      {result.msg} ({result.latency}ms)
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleTestConnection(router)}
                      disabled={isTesting}
                      className="flex-1 py-2 px-3 rounded-xl bg-surface hover:bg-surface-elevated text-foreground border border-border text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-primary" : ""}`} />
                      <span>{isTesting ? "Testing..." : "Test Connection"}</span>
                    </button>

                    <button
                      onClick={() => setSelectedRouterForScript(router)}
                      className="py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Script</span>
                    </button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Script Generator Modal */}
      {selectedRouterForScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    RouterOS Auto-Configuration Script
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Copy &amp; paste into MikroTik Terminal for instant zero-touch setup ({selectedRouterForScript.name})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRouterForScript(null)}
                className="w-8 h-8 rounded-lg bg-surface-elevated text-foreground flex items-center justify-center hover:bg-surface border border-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex-1 min-h-[250px] bg-slate-950 rounded-xl p-4 overflow-auto font-mono text-xs text-emerald-400 border border-slate-800">
              <pre className="whitespace-pre-wrap">{activeScript}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 shrink-0">
              <span className="text-xs text-muted-foreground">
                Configures WireGuard management tunnel, FreeRADIUS Client, and M-Pesa Walled Garden.
              </span>
              <button
                onClick={handleCopyScript}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-brand-btn transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Script"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
