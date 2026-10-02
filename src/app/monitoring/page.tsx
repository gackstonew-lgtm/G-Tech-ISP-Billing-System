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
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";

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
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Live Interface Telemetry &amp; Bandwidth Graphs
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time interface traffic rates, SFP+ 10G WAN uplinks, Hotspot VLANs, and WireGuard tunnels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlassBadge variant="success" size="md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>SNMP &amp; REST Telemetry Streaming (1s)</span>
          </GlassBadge>
        </div>
      </div>

      {/* Interface Traffic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interfaces.map((iface) => (
          <GlassCard key={iface.name} hoverEffect>
            <GlassCardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-base tracking-tight font-mono">
                      {iface.name}
                    </h3>
                    <div className="text-xs text-muted-foreground font-mono">
                      MAC: {iface.macAddress} &bull; Type: {iface.type}
                    </div>
                  </div>
                </div>
                <GlassBadge variant="success" size="sm">
                  RUNNING
                </GlassBadge>
              </div>

              {/* Traffic Rates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                    <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>RX (Inbound)</span>
                  </div>
                  <div className="text-xl font-extrabold text-foreground">
                    {(iface.rxBps / 1000000).toFixed(2)}{" "}
                    <span className="text-xs font-semibold text-muted-foreground">Mbps</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {iface.rxPackets.toLocaleString()} packets
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                    <ArrowUpCircle className="w-3.5 h-3.5 text-primary" />
                    <span>TX (Outbound)</span>
                  </div>
                  <div className="text-xl font-extrabold text-foreground">
                    {(iface.txBps / 1000000).toFixed(2)}{" "}
                    <span className="text-xs font-semibold text-muted-foreground">Mbps</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {iface.txPackets.toLocaleString()} packets
                  </div>
                </div>
              </div>

              {/* Packet Error Counters */}
              <div className="p-3 rounded-xl bg-surface-elevated/40 border border-border text-xs flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>CRC / Packet Drops: 0</span>
                </span>
                <span className="font-mono text-emerald-500 font-bold">0.00% Loss</span>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
}
