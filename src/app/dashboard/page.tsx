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

export default function DashboardPage() {
  const [stats, setStats] = useState(getSeedNOCStats());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate real-time metrics update
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
          <h2 className="text-xl font-bold text-white tracking-tight">
            Network Operations Center (NOC)
          </h2>
          <p className="text-xs text-slate-400">
            Real-time subscriber state, MikroTik router fleet telemetry, and M-Pesa revenue stream
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-sky-400" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Network"}</span>
          </button>
          <Link
            href="/vouchers"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-900/30 transition"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Generate Vouchers</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue Today */}
        <div className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Revenue (Today)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {formatKES(stats.revenueToday)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{formatKES(stats.revenueThisMonth)} this month</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Active Subscribers */}
        <div className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Active Subscribers
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {stats.activeSubscribers}{" "}
              <span className="text-xs font-normal text-slate-400">
                / {stats.totalSubscribers} total
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{stats.expiringIn24h} expiring in 24h</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Online Sessions (PPPoE + Hotspot) */}
        <div className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Active Online Sessions
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {stats.onlinePppoe + stats.onlineHotspot}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-cyan-400 font-semibold">{stats.onlinePppoe} PPPoE</span>
              <span>&bull;</span>
              <span className="text-teal-400 font-semibold">{stats.onlineHotspot} Hotspot</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 4: Current Fleet Traffic */}
        <div className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Live Bandwidth
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <span>{stats.currentBandwidthMbps.download}</span>
              <span className="text-xs font-medium text-slate-400">Mbps (Rx)</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-purple-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{stats.currentBandwidthMbps.upload} Mbps (Tx)</span>
              <span className="text-slate-400">&bull; {stats.onlineRouters} Routers Up</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Network Health & Fleet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MikroTik Fleet Status (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <RouterIcon className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                MikroTik Fleet & WireGuard Health
              </h3>
            </div>
            <Link
              href="/routers"
              className="text-xs font-medium text-sky-400 hover:text-sky-300 transition"
            >
              Manage Fleet &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {SEED_ROUTERS.map((router) => (
              <div
                key={router.id}
                className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      {router.name}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {router.boardModel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Site: <span className="text-slate-300">{router.siteName}</span> &bull; Tunnel:{" "}
                      <span className="font-mono text-sky-400">{router.wireguardTunnelIp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">CPU Load</div>
                    <div className="font-bold text-slate-200">{router.cpuLoad}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">RAM Free</div>
                    <div className="font-bold text-slate-200">{router.freeMemoryMb} MB</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase">Sessions</div>
                    <div className="font-bold text-emerald-400">{router.activeSessions} online</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Network Incident & Alarm Feed (1 Col) */}
        <div className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Network Alerts & Audits
              </h3>
            </div>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {stats.recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      alert.severity === "WARNING"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatShortDate(alert.createdAt)}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{alert.title}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{alert.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent M-Pesa Transactions Stream */}
      <div className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Real-Time M-Pesa & Mobile Money Transactions
            </h3>
          </div>
          <Link
            href="/billing"
            className="text-xs font-medium text-sky-400 hover:text-sky-300 transition"
          >
            View All Ledgers &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold bg-slate-900/40">
              <tr>
                <th className="py-2.5 px-3">Receipt / Ref</th>
                <th className="py-2.5 px-3">Customer / Phone</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SEED_PAYMENTS.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-3 font-mono font-semibold text-sky-400">
                    {payment.transactionReference}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">
                      {payment.senderName || payment.customerName || "Hotspot Guest"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {payment.msisdnPhone}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    {formatKES(payment.amount)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {formatShortDate(payment.processedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
