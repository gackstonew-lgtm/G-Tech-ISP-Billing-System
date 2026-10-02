"use client";
import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Router as RouterIcon,
  Plus,
  Shield,
  Activity,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  X,
} from "lucide-react";
import { SEED_ROUTERS, SEED_ORGANIZATION } from "@/lib/db/mock-db";
import { Router } from "@/types";
import { RouterScriptGenerator } from "@/lib/network/script-generator";
import { MikroTikService } from "@/lib/network/mikrotik";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";

export default function RoutersPage() {
  const [routers, setRouters] = useState<Router[]>(SEED_ROUTERS);
  const [selectedRouterForScript, setSelectedRouterForScript] = useState<Router | null>(null);
  const [copied, setCopied] = useState(false);
  const [testingRouterId, setTestingRouterId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { latency: number; msg: string }>>({});

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
        orgName: SEED_ORGANIZATION.name,
        orgSlug: SEED_ORGANIZATION.slug,
        orgId: SEED_ORGANIZATION.id,
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
    <AppShell title="MikroTik Fleet & WireGuard Orchestration">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            MikroTik Edge Routers
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated provisioning, WireGuard encrypted tunnels, RADIUS AAA integration, and live telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedRouterForScript(routers[0])}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-elevated text-foreground text-xs font-bold border border-border shadow-xs transition"
          >
            <Terminal className="w-4 h-4 text-primary" />
            <span>Generate RouterOS Script</span>
          </button>
        </div>
      </div>

      {/* Routers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routers.map((router) => {
          const test = testResults[router.id];
          return (
            <GlassCard key={router.id} className="flex flex-col justify-between" hoverEffect>
              <GlassCardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
                      <RouterIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-foreground text-sm tracking-tight">
                        {router.name}
                      </h3>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                        <span>{router.boardModel}</span>
                      </div>
                    </div>
                  </div>
                  <GlassBadge variant="success" size="sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>{router.status}</span>
                  </GlassBadge>
                </div>

                {/* Connection Specs */}
                <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between text-foreground">
                    <span className="text-muted-foreground">Tunnel IP (WG):</span>
                    <span className="font-mono text-primary font-bold">
                      {router.wireguardTunnelIp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-foreground">
                    <span className="text-muted-foreground">RouterOS:</span>
                    <span className="font-mono text-foreground font-semibold">{router.routerosVersion}</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground">
                    <span className="text-muted-foreground">POP Site:</span>
                    <span className="text-foreground font-medium">{router.siteName}</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="text-foreground font-mono">{router.uptime}</span>
                  </div>
                </div>

                {/* Performance telemetry */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-xl bg-surface-elevated/40 border border-border">
                    <div className="text-[10px] uppercase font-sans text-muted-foreground font-bold">CPU</div>
                    <div className="text-sm font-extrabold text-foreground">{router.cpuLoad}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated/40 border border-border">
                    <div className="text-[10px] uppercase font-sans text-muted-foreground font-bold">RAM Free</div>
                    <div className="text-sm font-extrabold text-foreground">{router.freeMemoryMb} MB</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated/40 border border-border">
                    <div className="text-[10px] uppercase font-sans text-muted-foreground font-bold">Sessions</div>
                    <div className="text-sm font-extrabold text-emerald-500">{router.activeSessions}</div>
                  </div>
                </div>

                {/* Handshake result */}
                {test && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between font-semibold">
                    <span>API Handshake OK</span>
                    <span className="font-mono font-bold">{test.latency} ms</span>
                  </div>
                )}
              </GlassCardContent>

              {/* Actions */}
              <div className="p-4 border-t border-border bg-surface-elevated/40 flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection(router)}
                  disabled={testingRouterId === router.id}
                  className="flex-1 py-2 px-3 rounded-xl bg-surface hover:bg-surface-elevated text-foreground text-xs font-bold border border-border shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingRouterId === router.id ? "animate-spin text-primary" : ""}`} />
                  <span>{testingRouterId === router.id ? "Testing..." : "Test API"}</span>
                </button>
                <button
                  onClick={() => setSelectedRouterForScript(router)}
                  className="py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition flex items-center gap-1 shadow-brand-btn"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Script</span>
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Script Generator Modal */}
      {selectedRouterForScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated/70">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-extrabold text-foreground text-base">
                    RouterOS Provisioning Script ({selectedRouterForScript.name})
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    Paste directly into MikroTik Terminal (Winbox &bull; New Terminal)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRouterForScript(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-surface-subtle">
              <pre className="p-4 rounded-xl bg-surface-elevated border border-border font-mono text-xs text-primary dark:text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed select-all">
                {activeScript}
              </pre>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-elevated/60">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Configures WireGuard, FreeRADIUS, and M-Pesa Walled Garden</span>
              </div>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-brand-btn transition"
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
