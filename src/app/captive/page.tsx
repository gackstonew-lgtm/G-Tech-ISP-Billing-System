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
  Sun,
  Moon,
} from "lucide-react";
import { SEED_PLANS } from "@/lib/db/mock-db";
import { formatKES } from "@/lib/utils";
import { MpesaService } from "@/lib/payments/mpesa";
import { useTheme } from "@/components/theme/ThemeProvider";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { NexaNetLogo } from "@/components/ui/NexaNetLogo";

export default function CaptivePortalPage() {
  const hotspotPlans = SEED_PLANS.filter((p) => p.serviceType === "HOTSPOT");
  const [activeTab, setActiveTab] = useState<"MPESA" | "VOUCHER">("MPESA");
  const { theme, toggleTheme } = useTheme();

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
      setVoucherStatus("Voucher Valid! Connected to NexaNet High-Speed WiFi.");
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Top Banner */}
      <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <NexaNetLogo variant="horizontal" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-9 h-9 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated transition shadow-xs"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>
            <Link
              href="/dashboard"
              className="text-[11px] font-bold text-foreground hover:text-primary px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated transition shadow-xs"
            >
              Dashboard &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Captive Body */}
      <main className="max-w-md mx-auto px-4 py-6 flex-1 w-full space-y-5">
        {/* Welcome Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Connect to Free WiFi
          </h1>
          <p className="text-xs text-muted-foreground">
            Select a package below to buy via M-Pesa or enter a voucher code
          </p>
        </div>

        {/* Tab Switcher (WebHunt Pill Design) */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface border border-border shadow-xs">
          <button
            onClick={() => setActiveTab("MPESA")}
            className={`py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "MPESA"
                ? "bg-primary text-primary-foreground shadow-brand-btn"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Buy via M-Pesa
          </button>
          <button
            onClick={() => setActiveTab("VOUCHER")}
            className={`py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "VOUCHER"
                ? "bg-primary text-primary-foreground shadow-brand-btn"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Use Voucher Code
          </button>
        </div>

        {/* Tab 1: M-Pesa Package Selection */}
        {activeTab === "MPESA" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                1. Select WiFi Package
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {hotspotPlans.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? "bg-surface-elevated border-primary shadow-xs"
                          : "bg-surface border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {plan.name.replace("Hotspot ", "")}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-base font-extrabold text-primary">
                          {formatKES(plan.price)}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {plan.downloadSpeedKbps / 1024} Mbps
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* M-Pesa Input Form */}
            <GlassCard>
              <form onSubmit={handleMpesaPay} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    2. Enter M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-foreground font-mono focus:outline-none focus:border-primary font-bold"
                    />
                  </div>
                </div>

                {stkMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{stkMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm transition flex items-center justify-center gap-2 shadow-brand-btn"
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isProcessing ? "Processing..." : `Pay ${formatKES(selectedPlan.price)} & Connect`}
                  </span>
                </button>
              </form>
            </GlassCard>
          </div>
        )}

        {/* Tab 2: Voucher Code Login */}
        {activeTab === "VOUCHER" && (
          <GlassCard>
            <form onSubmit={handleVoucherLogin} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Enter Scratch Voucher Code
                </label>
                <div className="relative">
                  <Ticket className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. GT1H-9842-KLP"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-surface-elevated border border-border text-sm font-mono text-foreground tracking-wider uppercase focus:outline-none focus:border-primary font-bold"
                  />
                </div>
              </div>

              {voucherStatus && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{voucherStatus}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm transition flex items-center justify-center gap-2 shadow-brand-btn"
              >
                <span>{isProcessing ? "Connecting..." : "Connect to Internet"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </GlassCard>
        )}

        {/* Support & Hotspot Notice */}
        <div className="p-4 rounded-2xl bg-surface border border-border text-[11px] text-muted-foreground space-y-1 text-center shadow-xs">
          <div>Need help or physical scratch vouchers? Contact Hotspot Admin:</div>
          <div className="font-mono text-foreground font-extrabold">+254 712 345 678</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-subtle py-4 text-center text-[11px] text-muted-foreground">
        <p>&copy; 2026 NexaNet Technologies ISP Network &amp; Billing.</p>
      </footer>
    </div>
  );
}
