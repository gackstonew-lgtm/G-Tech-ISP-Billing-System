"use client";
import React from "react";
import Link from "next/link";
import {
  Radio,
  Router as RouterIcon,
  CreditCard,
  Wifi,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Server,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0c1322]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-lg shadow-sky-500/20 font-bold">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">
                G-Tech ISP OS
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Kenyan ISP SaaS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition shadow-md shadow-sky-900/30 flex items-center gap-1.5"
            >
              <span>Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>Next-Gen Operating System for Kenyan ISPs & Hotspot Operators</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            MikroTik, FreeRADIUS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">M-Pesa Automated</span> ISP SaaS
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Unifying multi-tenant subscriber management, dynamic captive portals, WireGuard SDN router control, FreeRADIUS AAA, and instantaneous Safaricom Daraja STK push billing.
          </p>
        </div>

        {/* Portal Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: ISP Admin Operations */}
          <div className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800/90 hover:border-sky-500/50 transition duration-300 group flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition duration-200">
                <RouterIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                ISP Admin & NOC
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manage subscribers, MikroTik fleet, speed plans, WireGuard tunnels, financial ledgers, and real-time network telemetry.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>MikroTik v6/v7 Zero-Touch Provisioning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>FreeRADIUS Rate-Limiting & CoA Disconnect</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Batch Hotspot Voucher Generator & POS Print</span>
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Hotspot Captive Portal */}
          <div className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800/90 hover:border-emerald-500/50 transition duration-300 group flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition duration-200">
                <Wifi className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Hotspot Captive Portal
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ultra-fast captive portal for public WiFi zones with packages (1Hr, 3Hr, 24Hr, Weekly, Monthly) and instant M-Pesa STK checkout.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant 1-Click M-Pesa STK Push Login</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Voucher Code Card Redemption</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Optimized for low-end Android devices</span>
                </li>
              </ul>
            </div>
            <Link
              href="/captive"
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <span>Open Captive Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Customer Self-Care Portal */}
          <div className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800/90 hover:border-cyan-500/50 transition duration-300 group flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition duration-200">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Customer Self-Care
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Dedicated subscriber dashboard allowing home and business fiber customers to check speed, view usage, and pay via M-Pesa.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Live Expiry Counter & Grace Period Alert</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1-Click Subscription Renewal via STK</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Invoice & Payment Receipt Downloads</span>
                </li>
              </ul>
            </div>
            <Link
              href="/portal"
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30"
            >
              <span>Subscriber Self-Care</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="border-t border-slate-800/80 pt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-sky-400">99.98%</div>
              <div className="text-xs text-slate-400 mt-1">RADIUS AAA Uptime</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">&lt; 2.5s</div>
              <div className="text-xs text-slate-400 mt-1">M-Pesa STK Reconnect</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">WireGuard</div>
              <div className="text-xs text-slate-400 mt-1">Encrypted Router Control</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">Postgres RLS</div>
              <div className="text-xs text-slate-400 mt-1">Multi-Tenant Isolation</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080d18] py-6 text-center text-xs text-slate-400">
        <p>&copy; 2025 G-Tech ISP Operating System. Built for East African ISPs, WISPs & Community Hotspot Networks.</p>
      </footer>
    </div>
  );
}
