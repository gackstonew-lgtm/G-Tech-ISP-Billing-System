"use client";
import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Users,
  Wifi,
  Router as RouterIcon,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Plus,
  Ticket,
} from "lucide-react";
import {
  getSeedNOCStats,
  SEED_PAYMENTS,
  SEED_ROUTERS,
  SEED_CUSTOMERS,
} from "@/lib/db/mock-db";
import { formatKES, formatShortDate } from "@/lib/utils";
import Link from "next/link";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";

export default function DashboardPage() {
  const [stats, setStats] = useState(getSeedNOCStats());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        currentBandwidthMbps: {
          download: +(280 + Math.random() * 20).toFixed(1),
          upload: +(115 + Math.random() * 10).toFixed(1),
        },
      }));
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <AppShell title="Executive NOC & Revenue Operations">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Network Operations Center (NOC)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time subscriber state, MikroTik router fleet telemetry, and M-Pesa revenue stream
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-elevated text-foreground text-xs font-semibold border border-border shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Network"}</span>
          </button>
          <Link
            href="/vouchers"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-brand-btn transition"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Generate Vouchers</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue Today */}
        <GlassCard hoverEffect>
          <GlassCardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Revenue (Today)
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-foreground">
                {formatKES(stats.revenueToday)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{formatKES(stats.revenueThisMonth)} this month</span>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Card 2: Active Subscribers */}
        <GlassCard hoverEffect>
          <GlassCardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Active Subscribers
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-foreground">
                {stats.activeSubscribers}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  / {stats.totalSubscribers} total
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{stats.expiringIn24h} expiring in 24h</span>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Card 3: Online Sessions */}
        <GlassCard hoverEffect>
          <GlassCardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Active Online Sessions
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-foreground">
                {stats.onlinePppoe + stats.onlineHotspot}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                <span className="text-primary">{stats.onlinePppoe} PPPoE</span>
                <span>&bull;</span>
                <span className="text-emerald-500">{stats.onlineHotspot} Hotspot</span>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Card 4: Bandwidth */}
        <GlassCard hoverEffect>
          <GlassCardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Live Bandwidth
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-foreground flex items-center gap-1.5">
                <span>{stats.currentBandwidthMbps.download}</span>
                <span className="text-xs font-semibold text-muted-foreground">Mbps (Rx)</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-primary font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{stats.currentBandwidthMbps.upload} Mbps (Tx)</span>
                <span className="text-muted-foreground">&bull; {stats.onlineRouters} Routers</span>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Network Health & Incident Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Status (2 Cols) */}
        <div className="lg:col-span-2">
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <RouterIcon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  MikroTik Fleet &amp; WireGuard Health
                </h3>
              </div>
              <Link
                href="/routers"
                className="text-xs font-bold text-primary hover:text-primary-hover transition"
              >
                Manage Fleet &rarr;
              </Link>
            </GlassCardHeader>

            <GlassCardContent className="space-y-3">
              {SEED_ROUTERS.map((router) => (
                <div
                  key={router.id}
                  className="p-3.5 rounded-xl bg-surface-elevated/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-foreground flex items-center gap-2">
                        {router.name}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-muted-foreground font-mono">
                          {router.boardModel}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        Site: <span className="text-foreground">{router.siteName}</span> &bull; Tunnel:{" "}
                        <span className="text-primary font-semibold">{router.wireguardTunnelIp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <div className="text-muted-foreground text-[10px] uppercase font-sans">CPU</div>
                      <div className="font-bold text-foreground">{router.cpuLoad}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px] uppercase font-sans">RAM Free</div>
                      <div className="font-bold text-foreground">{router.freeMemoryMb} MB</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px] uppercase font-sans">Sessions</div>
                      <div className="font-bold text-emerald-500">{router.activeSessions} online</div>
                    </div>
                  </div>
                </div>
              ))}
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Network Alerts & Audits (1 Col) */}
        <div>
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  Network Alerts &amp; Audits
                </h3>
              </div>
              <GlassBadge variant="neutral" size="sm">
                Live Feed
              </GlassBadge>
            </GlassCardHeader>

            <GlassCardContent className="space-y-3">
              {stats.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-surface-elevated/40 border border-border space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <GlassBadge
                      variant={alert.severity === "WARNING" ? "warning" : "primary"}
                      size="sm"
                    >
                      {alert.severity}
                    </GlassBadge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatShortDate(alert.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-foreground">{alert.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{alert.message}</div>
                </div>
              ))}
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>

      {/* Recent M-Pesa Transactions Stream */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Real-Time M-Pesa &amp; Mobile Money Transactions
            </h3>
          </div>
          <Link
            href="/billing"
            className="text-xs font-bold text-primary hover:text-primary-hover transition"
          >
            View All Ledgers &rarr;
          </Link>
        </GlassCardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="border-b border-border text-[11px] uppercase text-muted-foreground font-bold bg-surface-elevated/50">
              <tr>
                <th className="py-3 px-4">Receipt / Ref</th>
                <th className="py-3 px-4">Customer / Phone</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SEED_PAYMENTS.map((payment) => (
                <tr key={payment.id} className="hover:bg-surface-elevated/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">
                    {payment.transactionReference}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">
                      {payment.senderName || payment.customerName || "Hotspot Guest"}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {payment.msisdnPhone}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-lg bg-surface border border-border text-muted-foreground text-[10px] font-mono">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-500">
                    {formatKES(payment.amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <GlassBadge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{payment.status}</span>
                    </GlassBadge>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-mono">
                    {formatShortDate(payment.processedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </AppShell>
  );
}
