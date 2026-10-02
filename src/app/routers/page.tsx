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
          <h2 className="text-xl font-bold text-white tracking-tight">
            MikroTik Edge Routers
          </h2>
          <p className="text-xs text-slate-400">
            Automated provisioning, WireGuard encrypted tunnels, RADIUS AAA integration, and live telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedRouterForScript(routers[0])}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Generate RouterOS Script</span>
          </button>
        </div>
      </div>

      {/* Routers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routers.map((router) => {
          const test = testResults[router.id];
          return (
            <div
              key={router.id}
              className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 shadow-xl space-y-4 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                      <RouterIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm tracking-tight">
                        {router.name}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                        <span>{router.boardModel}</span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {router.status}
                  </span>
                </div>

                {/* Connection Specs */}
                <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Tunnel IP (WG):</span>
                    <span className="font-mono text-sky-400 font-semibold">
                      {router.wireguardTunnelIp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">RouterOS:</span>
                    <span className="font-mono text-slate-200">{router.routerosVersion}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">POP Site:</span>
                    <span className="text-slate-200 font-medium">{router.siteName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Uptime:</span>
                    <span className="text-slate-200">{router.uptime}</span>
                  </div>
                </div>

                {/* Performance telemetry */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                    <div className="text-[10px] uppercase text-slate-400">CPU</div>
                    <div className="text-sm font-bold text-slate-200">{router.cpuLoad}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                    <div className="text-[10px] uppercase text-slate-400">Free RAM</div>
                    <div className="text-sm font-bold text-slate-200">{router.freeMemoryMb} MB</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                    <div className="text-[10px] uppercase text-slate-400">Sessions</div>
                    <div className="text-sm font-bold text-emerald-400">{router.activeSessions}</div>
                  </div>
                </div>

                {/* Handshake result */}
                {test && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                    <span>API Handshake OK</span>
                    <span className="font-mono font-bold">{test.latency} ms</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => handleTestConnection(router)}
                  disabled={testingRouterId === router.id}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingRouterId === router.id ? "animate-spin text-sky-400" : ""}`} />
                  <span>{testingRouterId === router.id ? "Testing..." : "Test API"}</span>
                </button>
                <button
                  onClick={() => setSelectedRouterForScript(router)}
                  className="py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition flex items-center gap-1 shadow-md shadow-sky-900/20"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Script</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Script Generator Modal */}
      {selectedRouterForScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    RouterOS Provisioning Script ({selectedRouterForScript.name})
                  </h3>
                  <div className="text-xs text-slate-400">
                    Paste directly into MikroTik Terminal (Winbox &bull; New Terminal)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRouterForScript(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed select-all">
                {activeScript}
              </pre>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Configures WireGuard, FreeRADIUS, and M-Pesa Walled Garden</span>
              </div>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-900/30 transition"
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
