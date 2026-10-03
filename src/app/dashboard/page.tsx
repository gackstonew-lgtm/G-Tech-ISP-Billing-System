"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Wifi,
  CreditCard,
  Clock,
  PauseCircle,
  Router as RouterIcon,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  Banknote,
  Bell,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getSeedNOCStats, SEED_PAYMENTS, SEED_ROUTERS } from "@/lib/db/mock-db";
import type { NOCStats, Router, Payment } from "@/types";
import { cn, formatKES, formatShortDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader, btnClass } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";

// ---------- helpers ----------

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "—";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return `${d} d ago`;
}

type Period = 7 | 30;

/** Sum COMPLETED payments per local calendar day for the last N days. */
function collectedByDay(payments: Payment[], days: Period) {
  const buckets: { key: string; label: string; total: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.push({
      key: d.toDateString(),
      label: d.toLocaleDateString("en-KE", { day: "numeric", month: "short" }),
      total: 0,
    });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    const when = new Date(p.processedAt ?? p.createdAt);
    when.setHours(0, 0, 0, 0);
    const b = index.get(when.toDateString());
    if (b) b.total += p.amount;
  }
  return buckets;
}

// ---------- small building blocks ----------

function Metric({
  label,
  value,
  context,
  href,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  context?: React.ReactNode;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "warning" | "danger";
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-border bg-surface p-3 shadow-xs transition-colors hover:border-border-strong"
    >
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div
        className={cn(
          "tabular mt-1 text-xl font-semibold leading-7 tracking-tight",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-danger",
          tone === "neutral" && "text-foreground"
        )}
      >
        {value}
      </div>
      {context && <div className="mt-0.5 text-xs text-muted-foreground">{context}</div>}
    </Link>
  );
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-surface shadow-xs", className)}>
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action && (
          <Link href={action.href} className="text-xs font-medium text-primary hover:underline">
            {action.label}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

// ---------- page ----------

export default function DashboardPage() {
  const { isDemoMode, isLoading: authLoading, organization, user } = useAuth();

  const [stats, setStats] = useState<NOCStats | null>(null);
  const [routers, setRouters] = useState<Router[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>(7);

  const load = useCallback(async () => {
    setError(null);
    if (isDemoMode) {
      setStats(getSeedNOCStats());
      setRouters(SEED_ROUTERS);
      setPayments(SEED_PAYMENTS);
      setIsLoading(false);
      return;
    }
    try {
      const [nocRes, routerRes, payRes] = await Promise.all([
        fetch("/api/v1/monitoring/noc"),
        fetch("/api/v1/mikrotik-fleet"),
        fetch("/api/v1/payments?limit=500"),
      ]);
      const [noc, fleet, pay] = await Promise.all([nocRes.json(), routerRes.json(), payRes.json()]);

      if (noc?.success && noc.data) setStats(noc.data);
      else throw new Error("Operations statistics are unavailable.");
      setRouters(fleet?.success ? fleet.data : []);
      setPayments(pay?.success ? pay.data : []);
    } catch (err) {
      console.error("[Dashboard] load failed:", err);
      setError("Some dashboard data could not be loaded. Nothing was changed.");
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (authLoading) return;
    setIsLoading(true);
    load();
  }, [authLoading, load, user?.id]);

  const refresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  // ----- derived (all from loaded data) -----
  const failedPayments = payments.filter((p) => p.status === "FAILED").length;
  const pendingPayments = payments.filter((p) => p.status === "PENDING" || p.status === "INITIATED").length;
  const offlineRouters = stats ? Math.max(stats.totalRouters - stats.onlineRouters, 0) : 0;
  const openAlerts = stats?.recentAlerts.filter((a) => !a.isResolved) ?? [];
  const criticalAlerts = openAlerts.filter((a) => a.severity === "CRITICAL").length;

  const attention = useMemo(() => {
    if (!stats) return [];
    const items: { key: string; text: string; href: string; tone: "warning" | "danger" }[] = [];
    if (stats.expiringIn24h > 0)
      items.push({ key: "exp", text: `${stats.expiringIn24h} subscription${stats.expiringIn24h > 1 ? "s" : ""} expire within 24 hours`, href: "/customers", tone: "warning" });
    if (failedPayments > 0)
      items.push({ key: "fail", text: `${failedPayments} failed payment${failedPayments > 1 ? "s" : ""}`, href: "/billing", tone: "danger" });
    if (pendingPayments > 0)
      items.push({ key: "pend", text: `${pendingPayments} pending M-Pesa transaction${pendingPayments > 1 ? "s" : ""}`, href: "/billing", tone: "warning" });
    if (offlineRouters > 0)
      items.push({ key: "rtr", text: `${offlineRouters} router${offlineRouters > 1 ? "s" : ""} offline`, href: "/routers", tone: "danger" });
    if (criticalAlerts > 0)
      items.push({ key: "alert", text: `${criticalAlerts} critical network alert${criticalAlerts > 1 ? "s" : ""}`, href: "/monitoring", tone: "danger" });
    if (stats.suspendedCount > 0)
      items.push({ key: "susp", text: `${stats.suspendedCount} suspended subscriber${stats.suspendedCount > 1 ? "s" : ""}`, href: "/customers", tone: "warning" });
    return items;
  }, [stats, failedPayments, pendingPayments, offlineRouters, criticalAlerts]);

  const activity = useMemo(() => {
    const rows: { key: string; when: string; title: string; detail: string; tone: "success" | "danger" | "warning" | "info" }[] = [];
    for (const p of payments.slice(0, 8)) {
      const who = p.senderName || p.customerName || p.msisdnPhone;
      rows.push({
        key: `p-${p.id}`,
        when: p.processedAt ?? p.createdAt,
        title: p.status === "COMPLETED" ? "Payment received" : p.status === "FAILED" ? "Payment failed" : "Payment pending",
        detail: `${formatKES(p.amount)} from ${who} · ${p.transactionReference}`,
        tone: p.status === "COMPLETED" ? "success" : p.status === "FAILED" ? "danger" : "warning",
      });
    }
    for (const a of stats?.recentAlerts.slice(0, 5) ?? []) {
      rows.push({
        key: `a-${a.id}`,
        when: a.createdAt,
        title: a.title,
        detail: a.message,
        tone: a.severity === "CRITICAL" ? "danger" : a.severity === "WARNING" ? "warning" : "info",
      });
    }
    return rows.sort((x, y) => new Date(y.when).getTime() - new Date(x.when).getTime()).slice(0, 8);
  }, [payments, stats]);

  const buckets = useMemo(() => collectedByDay(payments, period), [payments, period]);
  const periodTotal = buckets.reduce((s, b) => s + b.total, 0);
  const maxBucket = Math.max(...buckets.map((b) => b.total), 1);

  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const header = (
    <PageHeader
      title={organization?.name ? `${organization.name}` : "Operations overview"}
      description={`Operations overview · ${today}`}
      actions={
        <>
          <button onClick={refresh} disabled={isRefreshing} className={btnClass("secondary")}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} aria-hidden="true" />
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
          <Link href="/customers" className={btnClass("primary")}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Add subscriber
          </Link>
        </>
      }
    />
  );

  // ----- loading skeleton matching final layout -----
  if (isLoading || !stats) {
    return (
      <AppShell title="Dashboard">
        {header}
        {error && !stats ? (
          <ErrorState title="Dashboard could not be loaded" detail={error} onRetry={refresh} />
        ) : (
          <div role="status" aria-label="Loading dashboard" className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-border bg-surface p-3">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Skeleton className="h-64 lg:col-span-2" />
              <Skeleton className="h-64" />
            </div>
          </div>
        )}
      </AppShell>
    );
  }

  const sessionsKnown = stats.sessionsAvailable !== false;

  return (
    <AppShell title="Dashboard">
      {header}
      {error && <ErrorState title="Some data is out of date" detail={error} onRetry={refresh} />}

      {/* Key metrics: each answers a question and links to where you act on it */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric
          label="Active subscribers"
          icon={Users}
          href="/customers"
          value={stats.activeSubscribers.toLocaleString("en-KE")}
          context={`of ${stats.totalSubscribers.toLocaleString("en-KE")} total`}
        />
        <Metric
          label="Online now"
          icon={Wifi}
          href="/monitoring"
          value={sessionsKnown ? (stats.onlinePppoe + stats.onlineHotspot).toLocaleString("en-KE") : "—"}
          context={
            sessionsKnown
              ? `${stats.onlinePppoe} PPPoE · ${stats.onlineHotspot} hotspot`
              : "Live sessions not connected"
          }
        />
        <Metric
          label="Collected today"
          icon={CreditCard}
          href="/billing"
          value={formatKES(stats.revenueToday)}
          context="Completed payments"
        />
        <Metric
          label="Collected this month"
          icon={Banknote}
          href="/billing"
          value={formatKES(stats.revenueThisMonth)}
          context="Month to date"
        />
        <Metric
          label="Expiring in 24 h"
          icon={Clock}
          href="/customers"
          value={stats.expiringIn24h}
          tone={stats.expiringIn24h > 0 ? "warning" : "neutral"}
          context="Active subscriptions"
        />
        <Metric
          label="Suspended"
          icon={PauseCircle}
          href="/customers"
          value={stats.suspendedCount}
          tone={stats.suspendedCount > 0 ? "danger" : "neutral"}
          context="Service cut off"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Revenue */}
          <Panel title="Collected revenue" action={{ href: "/billing", label: "View payments" }}>
            <div className="p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="tabular text-xl font-semibold tracking-tight">{formatKES(periodTotal)}</div>
                  <div className="text-xs text-muted-foreground">Completed payments, last {period} days</div>
                </div>
                <div role="group" aria-label="Period" className="inline-flex rounded-md border border-border p-0.5">
                  {([7, 30] as Period[]).map((p) => (
                    <button
                      key={p}
                      aria-pressed={period === p}
                      onClick={() => setPeriod(p)}
                      className={cn(
                        "h-7 rounded px-2.5 text-xs font-medium transition-colors",
                        period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {p} days
                    </button>
                  ))}
                </div>
              </div>

              {periodTotal === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No completed payments in this period"
                  description="Payments confirmed through M-Pesa will appear here as they are reconciled."
                  className="py-8"
                />
              ) : (
                <div className="mt-4">
                  <div className="flex h-36 items-end gap-px" role="img" aria-label={`Daily collected revenue, last ${period} days`}>
                    {buckets.map((b) => (
                      <div key={b.key} className="group relative flex h-full flex-1 items-end">
                        <div
                          className={cn("w-full rounded-t-sm", b.total > 0 ? "bg-primary" : "bg-surface-elevated")}
                          style={{ height: `${Math.max((b.total / maxBucket) * 100, b.total > 0 ? 3 : 1)}%` }}
                          title={`${b.label}: ${formatKES(b.total)}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{buckets[0].label}</span>
                    <span>{buckets[buckets.length - 1].label}</span>
                  </div>
                  {payments.length >= 500 && (
                    <p className="mt-2 text-xs text-muted-foreground">Based on the latest 500 payments.</p>
                  )}
                </div>
              )}
            </div>
          </Panel>

          {/* Network health */}
          <Panel title="Network health" action={{ href: "/routers", label: "All routers" }}>
            <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-border px-4 py-2 text-xs text-muted-foreground">
              <span>
                Routers online{" "}
                <strong className={cn("tabular font-semibold", offlineRouters > 0 ? "text-danger" : "text-foreground")}>
                  {stats.onlineRouters}/{stats.totalRouters}
                </strong>
              </span>
              <span>
                Open alerts <strong className="tabular font-semibold text-foreground">{openAlerts.length}</strong>
              </span>
              {sessionsKnown && stats.currentBandwidthMbps.download > 0 && (
                <span>
                  Throughput{" "}
                  <strong className="tabular font-semibold text-foreground">
                    ↓ {stats.currentBandwidthMbps.download} / ↑ {stats.currentBandwidthMbps.upload} Mbps
                  </strong>
                </span>
              )}
            </div>
            {routers.length === 0 ? (
              <EmptyState
                icon={RouterIcon}
                title="No routers added yet"
                description="Add your core MikroTik router to monitor its status, sessions and tunnels."
                action={
                  <Link href="/routers" className={btnClass("primary")}>
                    Add router
                  </Link>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                      <th scope="col" className="px-4 py-2 font-medium">Router</th>
                      <th scope="col" className="px-2 py-2 font-medium">Status</th>
                      <th scope="col" className="px-2 py-2 font-medium">Management IP</th>
                      <th scope="col" className="px-2 py-2 text-right font-medium">CPU</th>
                      <th scope="col" className="px-2 py-2 font-medium">Uptime</th>
                      <th scope="col" className="px-4 py-2 font-medium">Last seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {routers.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-subtle">
                        <td className="px-4 py-2">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.siteName || r.boardModel}</div>
                        </td>
                        <td className="px-2 py-2"><StatusBadge status={r.status} /></td>
                        <td className="tabular px-2 py-2 font-mono text-xs">{r.wireguardTunnelIp || r.managementIp}</td>
                        <td className="tabular px-2 py-2 text-right">{r.cpuLoad}%</td>
                        <td className="px-2 py-2 text-muted-foreground">{r.uptime || "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground">{timeAgo(r.lastSeenAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          {/* Needs attention */}
          <Panel title="Needs attention">
            {attention.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                Nothing needs action right now.
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {attention.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-subtle"
                    >
                      <span
                        aria-hidden="true"
                        className={cn("h-2 w-2 shrink-0 rounded-full", item.tone === "danger" ? "bg-danger" : "bg-warning")}
                      />
                      <span className="flex-1">{item.text}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Recent activity */}
          <Panel title="Recent activity">
            {activity.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No activity yet"
                description="Payments and network events will appear here."
                className="py-8"
              />
            ) : (
              <ul className="divide-y divide-border-subtle">
                {activity.map((a) => (
                  <li key={a.key} className="flex gap-3 px-4 py-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        a.tone === "success" && "bg-success",
                        a.tone === "danger" && "bg-danger",
                        a.tone === "warning" && "bg-warning",
                        a.tone === "info" && "bg-info"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-5">{a.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{a.detail}</div>
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground" title={formatShortDate(a.when)}>
                      {timeAgo(a.when)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
