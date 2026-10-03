"use client";
import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Activity, Bell } from "lucide-react";
import { MikroTikService, LiveInterfaceMetric } from "@/lib/network/mikrotik";
import { getSeedNOCStats } from "@/lib/db/mock-db";
import type { NetworkAlert } from "@/types";
import { useAuth } from "@/lib/auth/auth-context";
import { cn, formatShortDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/States";

const SEVERITY_TONE: Record<NetworkAlert["severity"], string> = {
  CRITICAL: "bg-danger",
  WARNING: "bg-warning",
  INFO: "bg-info",
};

export default function MonitoringPage() {
  const { isDemoMode, isLoading: authLoading, user } = useAuth();

  const [interfaces, setInterfaces] = useState<LiveInterfaceMetric[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    if (isDemoMode) {
      // Sample interface metrics exist only for the demo dataset.
      setInterfaces(await MikroTikService.getInterfaceMetrics("rtr-01"));
      setAlerts(getSeedNOCStats().recentAlerts);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/v1/monitoring/noc");
      const data = await res.json();
      if (data?.success && data.data) setAlerts(data.data.recentAlerts ?? []);
      else setError("Network alerts could not be loaded. Nothing was changed.");
    } catch {
      setError("Network alerts could not be loaded. Nothing was changed.");
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    load();
  }, [authLoading, load, user?.id]);

  return (
    <AppShell title="Monitoring">
      <PageHeader
        title="Monitoring"
        description="Open network alerts and interface traffic."
        actions={
          isDemoMode ? (
            <span className="rounded-md border border-warning/30 bg-warning-soft px-2 py-1 text-xs font-medium text-warning">
              Sample data
            </span>
          ) : undefined
        }
      />

      {error && <ErrorState title="Could not load monitoring data" detail={error} onRetry={load} />}

      {/* Alerts: real in every mode */}
      <section className="rounded-lg border border-border bg-surface shadow-xs">
        <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h3 className="text-sm font-semibold">Open alerts</h3>
          <span className="tabular text-xs text-muted-foreground">{loading ? "" : alerts.length}</span>
        </header>
        {loading ? (
          <TableSkeleton rows={3} cols={3} />
        ) : alerts.length === 0 ? (
          <EmptyState icon={Bell} title="No open alerts" description="Router and service alerts will appear here when they are raised." className="py-8" />
        ) : (
          <ul className="divide-y divide-border-subtle">
            {alerts.map((a) => (
              <li key={a.id} className="flex gap-3 px-4 py-2.5">
                <span aria-hidden="true" className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", SEVERITY_TONE[a.severity])} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{a.title}</span>
                    <span className="rounded border border-border px-1 text-xs text-muted-foreground">{a.severity}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.message}</p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">{formatShortDate(a.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Interface traffic: only shown with data we actually have */}
      <section className="rounded-lg border border-border bg-surface shadow-xs">
        <header className="border-b border-border px-4 py-2.5">
          <h3 className="text-sm font-semibold">Interface traffic</h3>
        </header>
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : interfaces.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Live interface traffic is not connected"
            description="Per-interface throughput appears here once router telemetry collection is set up. No figures are shown until then."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Interface</th>
                  <th scope="col" className="px-3 py-2 font-medium">State</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Rx (Mbps)</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Tx (Mbps)</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Errors (Rx / Tx)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {interfaces.map((iface) => (
                  <tr key={iface.name} className="hover:bg-surface-subtle">
                    <td className="px-3 py-2">
                      <div className="font-mono text-sm font-medium">{iface.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{iface.type} · {iface.macAddress}</div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={iface.running ? "ONLINE" : "OFFLINE"} label={iface.running ? "Running" : "Down"} />
                    </td>
                    <td className="tabular px-3 py-2 text-right">{(iface.rxBps / 1_000_000).toFixed(2)}</td>
                    <td className="tabular px-3 py-2 text-right">{(iface.txBps / 1_000_000).toFixed(2)}</td>
                    <td className={cn("tabular px-3 py-2 text-right", iface.rxErrors + iface.txErrors > 0 && "font-medium text-danger")}>
                      {iface.rxErrors} / {iface.txErrors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
