"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Wifi,
  Ticket,
  Zap,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  Radio,
} from "lucide-react";
import { SEED_PLANS } from "@/lib/db/mock-db";
import { formatKES } from "@/lib/utils";
import { MpesaService } from "@/lib/payments/mpesa";

export default function CaptivePortalPage() {
  const hotspotPlans = SEED_PLANS.filter((p) => p.serviceType === "HOTSPOT");
  const [activeTab, setActiveTab] = useState<"MPESA" | "VOUCHER">("MPESA");

  // M-Pesa Checkout State
  const [selectedPlan, setSelectedPlan] = useState(hotspotPlans[0]);
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stkMessage, setStkMessage] = useState<string | null>(null);

  // Voucher Login State
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<string | null>(null);

  const handleMpesaPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsProcessing(true);
    setStkMessage("Sending STK Push prompt to your phone... Check your screen.");

    const res = await MpesaService.initiateSTKPush({
      phoneNumber: phone,
      amount: selectedPlan.price,
      accountReference: `HS-${selectedPlan.name.substring(0, 4)}`,
      transactionDesc: `Hotspot ${selectedPlan.name}`,
    });

    if (res.success) {
      setTimeout(() => {
        setStkMessage(`Payment received! You are now connected to high-speed WiFi for ${selectedPlan.name}. Enjoy browsing!`);
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleVoucherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode) return;
    setIsProcessing(true);
    setVoucherStatus("Authenticating voucher with FreeRADIUS AAA...");

    setTimeout(() => {
      setVoucherStatus("Voucher Valid! Connected to G-Tech High-Speed WiFi.");
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Banner */}
      <header className="border-b border-slate-800/80 bg-[#0c1322]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/30">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white leading-tight">
                G-Tech Free WiFi
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                High-Speed Hotspot Zone
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded border border-slate-800 hover:bg-slate-800 transition"
          >
            NOC &rarr;
          </Link>
        </div>
      </header>

      {/* Main Captive Body */}
      <main className="max-w-md mx-auto px-4 py-6 flex-1 w-full space-y-5">
        {/* Welcome Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Connect to High-Speed Internet
          </h1>
          <p className="text-xs text-slate-400">
            Select a package below to buy via M-Pesa or enter a voucher code
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("MPESA")}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "MPESA"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Buy via M-Pesa
          </button>
          <button
            onClick={() => setActiveTab("VOUCHER")}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "VOUCHER"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Use Voucher Code
          </button>
        </div>

        {/* Tab 1: M-Pesa Package Selection */}
        {activeTab === "MPESA" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                1. Select WiFi Package
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {hotspotPlans.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30"
                          : "bg-[#0e1626] border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {plan.name.replace("Hotspot ", "")}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-sm font-extrabold text-emerald-400">
                          {formatKES(plan.price)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {plan.downloadSpeedKbps / 1024} Mbps
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* M-Pesa Input Form */}
            <form onSubmit={handleMpesaPay} className="p-4 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  2. Enter M-Pesa Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {stkMessage && (
                <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{stkMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {isProcessing ? "Processing..." : `Pay ${formatKES(selectedPlan.price)} & Connect`}
                </span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Voucher Code Login */}
        {activeTab === "VOUCHER" && (
          <form onSubmit={handleVoucherLogin} className="p-5 rounded-2xl bg-[#0e1626] border border-slate-800 space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Enter Scratch Voucher Code
              </label>
              <div className="relative">
                <Ticket className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. GT1H-9842-KLP"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-white tracking-wider uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {voucherStatus && (
              <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{voucherStatus}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <span>{isProcessing ? "Connecting..." : "Connect to Internet"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Support & Hotspot Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 text-center">
          <div>Need help or cash vouchers? Contact Hotspot Admin:</div>
          <div className="font-mono text-slate-200 font-bold">+254 712 345 678</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080d18] py-4 text-center text-[11px] text-slate-400">
        <p>&copy; 2025 G-Tech Networks. Powered by FreeRADIUS & MikroTik RouterOS.</p>
      </footer>
    </div>
  );
}
