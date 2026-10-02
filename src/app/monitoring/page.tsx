"use client";
import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Radio,
} from "lucide-react";
import { MikroTikService, LiveInterfaceMetric } from "@/lib/network/mikrotik";
import { formatBytes } from "@/lib/utils";

export default function MonitoringPage() {
  const [interfaces, setInterfaces] = useState<LiveInterfaceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MikroTikService.getInterfaceMetrics("rtr-01").then((data) => {
      setInterfaces(data);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell title="Live Network Telemetry & NOC">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Live Interface Telemetry & Bandwidth Graphs
          </h2>
          <p className="text-xs text-slate-400">
            Real-time interface traffic rates, SFP+ 10G WAN uplinks, Hotspot VLANs, and WireGuard tunnels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            SNMP & REST Telemetry Streaming (1s)
          </span>
        </div>
      </div>

      {/* Interface Traffic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interfaces.map((iface) => (
          <div
            key={iface.name}
            className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800/80 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-tight font-mono">
                    {iface.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    MAC: {iface.macAddress} &bull; Type: {iface.type}
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                RUNNING
              </span>
            </div>

            {/* Traffic Rates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>RX (Inbound)</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {(iface.rxBps / 1000000).toFixed(2)}{" "}
                  <span className="text-xs font-medium text-slate-400">Mbps</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {iface.rxPackets.toLocaleString()} packets
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>TX (Outbound)</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {(iface.txBps / 1000000).toFixed(2)}{" "}
                  <span className="text-xs font-medium text-slate-400">Mbps</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {iface.txPackets.toLocaleString()} packets
                </div>
              </div>
            </div>

            {/* Packet Error Counters */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>CRC / Packet Drops: 0</span>
              </span>
              <span className="font-mono text-emerald-400 font-semibold">0.00% Loss</span>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
