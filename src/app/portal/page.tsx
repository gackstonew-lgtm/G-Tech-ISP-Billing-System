"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Wifi,
  CreditCard,
  Zap,
  CheckCircle2,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  HelpCircle,
  Phone,
  User,
  ShieldCheck,
  Send,
} from "lucide-react";
import {
  SEED_CUSTOMERS,
  SEED_PLANS,
  SEED_PPPOE,
  SEED_SUBSCRIPTIONS,
} from "@/lib/db/mock-db";
import { formatKES, formatBytes, formatShortDate } from "@/lib/utils";
import { MpesaService } from "@/lib/payments/mpesa";

export default function CustomerPortalPage() {
  const customer = SEED_CUSTOMERS[0]; // John Kamau Mwangi
  const pppoe = SEED_PPPOE[0];
  const plan = SEED_PLANS[1]; // 10 Mbps
  const sub = SEED_SUBSCRIPTIONS[0];

  const [phone, setPhone] = useState(customer.phoneNumber);
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewStatus, setRenewStatus] = useState<string | null>(null);

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRenewing(true);
    setRenewStatus("Sending STK Push prompt to your M-Pesa phone...");

    const res = await MpesaService.initiateSTKPush({
      phoneNumber: phone,
      amount: plan.price,
      accountReference: customer.accountNumber,
      transactionDesc: `Renew ${plan.name}`,
    });

    if (res.success) {
      setTimeout(() => {
        setRenewStatus("Payment verified! Subscription extended by 30 days. Internet access active.");
        setIsRenewing(false);
      }, 1800);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#0c1322]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-lg shadow-sky-500/20 font-bold">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">
                G-Tech Subscriber Care
              </span>
              <div className="text-[10px] text-slate-400">
                Account: <span className="text-sky-400 font-mono font-bold">{customer.accountNumber}</span>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
          >
            Operator NOC &rarr;
          </Link>
        </div>
      </header>

      {/* Main Portal View */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Welcome Card & Status */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/50 via-[#0e1626] to-[#0e1626] border border-sky-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
              Connected Subscriber
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">
              {customer.fullName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Installation Address: {customer.physicalAddress}
            </p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Internet Connected (Online)
            </span>
            <div className="text-[11px] text-slate-400">
              IP: <span className="font-mono text-slate-300">{pppoe.currentIp}</span>
            </div>
          </div>
        </div>

        {/* Current Plan & Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan Details (2 Cols) */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Current Service Tier
                </span>
                <h2 className="text-xl font-bold text-white mt-2">
                  {plan.name}
                </h2>
                <div className="text-xs text-slate-400">
                  Unlimited high-speed fiber internet
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-white">
                  {formatKES(plan.price)}
                </div>
                <div className="text-[10px] text-slate-400">Monthly Renewal</div>
              </div>
            </div>

            {/* Speeds */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                  <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                  <span>Download Speed</span>
                </div>
                <div className="text-xl font-bold text-white">10 Mbps</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Unlimited Quota</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                  <ArrowUpCircle className="w-4 h-4 text-sky-400" />
                  <span>Upload Speed</span>
                </div>
                <div className="text-xl font-bold text-white">5 Mbps</div>
                <div className="text-[10px] text-sky-400 font-semibold">Low Latency Fiber</div>
              </div>
            </div>

            {/* Usage */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Monthly Bandwidth Consumption</span>
                <span className="font-mono font-bold text-sky-400">
                  {formatBytes(pppoe.bytesIn! + pppoe.bytesOut!)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full w-2/5" />
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Total In: {formatBytes(pppoe.bytesIn!)}</span>
                <span>Total Out: {formatBytes(pppoe.bytesOut!)}</span>
              </div>
            </div>
          </div>

          {/* Quick M-Pesa Renewal Card (1 Col) */}
          <div className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Instant Renewal</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Pay directly with Safaricom M-Pesa STK Push
              </p>

              <form onSubmit={handleRenew} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    M-Pesa Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Renewal Amount
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formatKES(plan.price)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold"
                  />
                </div>

                {renewStatus && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] leading-snug">
                    {renewStatus}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRenewing}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isRenewing ? "Sending STK..." : "Pay Now via M-Pesa"}</span>
                </button>
              </form>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>Paybill: <span className="font-mono text-slate-200">174379</span></div>
              <div>Account: <span className="font-mono text-sky-400">{customer.accountNumber}</span></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#080d18] py-4 text-center text-xs text-slate-400">
        <p>Support Hotline: +254 712 345 678 &bull; Email: support@gtechisp.co.ke</p>
      </footer>
    </div>
  );
}
