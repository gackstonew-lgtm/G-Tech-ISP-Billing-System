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
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import {
  SEED_CUSTOMERS,
  SEED_PLANS,
  SEED_PPPOE,
  SEED_SUBSCRIPTIONS,
} from "@/lib/db/mock-db";
import { formatKES, formatBytes, formatShortDate } from "@/lib/utils";
import { MpesaService } from "@/lib/payments/mpesa";
import { useTheme } from "@/components/theme/ThemeProvider";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { NexaNetLogo } from "@/components/ui/NexaNetLogo";
import { PortalSelfServicePanels } from "@/components/portal/PortalSelfServicePanels";

export default function CustomerPortalPage() {
  const customer = SEED_CUSTOMERS[0];
  const pppoe = SEED_PPPOE[0];
  const plan = SEED_PLANS[1];
  const sub = SEED_SUBSCRIPTIONS[0];
  const { theme, toggleTheme } = useTheme();

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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <NexaNetLogo variant="horizontal" />
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated hover:border-primary/50 transition-all duration-200 shadow-xs"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-foreground hover:text-primary px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated transition shadow-xs"
            >
              Operator Dashboard &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Portal View */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Welcome Card & Status */}
        <GlassCard>
          <GlassCardContent className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <GlassBadge variant="primary" size="sm">
                Connected Subscriber
              </GlassBadge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
                {customer.fullName}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Installation Address: {customer.physicalAddress}
              </p>
            </div>
            <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1.5">
              <GlassBadge variant="success" size="md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Internet Connected (Online)</span>
              </GlassBadge>
              <div className="text-[11px] text-muted-foreground font-mono">
                Assigned IP: <span className="text-foreground font-bold">{pppoe.currentIp}</span>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Current Plan & Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan Details (2 Cols) */}
          <div className="md:col-span-2">
            <GlassCard className="h-full flex flex-col justify-between">
              <GlassCardContent className="p-6 sm:p-8 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <GlassBadge variant="primary" size="sm">
                      Current Service Tier
                    </GlassBadge>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mt-2">
                      {plan.name}
                    </h2>
                    <div className="text-xs text-muted-foreground">
                      Unlimited high-speed fiber internet
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-foreground">
                      {formatKES(plan.price)}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-semibold">Monthly Renewal</div>
                  </div>
                </div>

                {/* Speeds */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                      <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
                      <span>Download Speed</span>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">10 Mbps</div>
                    <div className="text-[10px] text-emerald-500 font-bold">Unlimited Quota</div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                      <ArrowUpCircle className="w-4 h-4 text-primary" />
                      <span>Upload Speed</span>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">5 Mbps</div>
                    <div className="text-[10px] text-primary font-bold">Low Latency Fiber</div>
                  </div>
                </div>

                {/* Usage */}
                <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs text-foreground font-semibold">
                    <span>Monthly Bandwidth Consumption</span>
                    <span className="font-mono font-bold text-primary">
                      {formatBytes(pppoe.bytesIn! + pppoe.bytesOut!)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-2/5" />
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center justify-between font-mono">
                    <span>Total In: {formatBytes(pppoe.bytesIn!)}</span>
                    <span>Total Out: {formatBytes(pppoe.bytesOut!)}</span>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Quick M-Pesa Renewal Card (1 Col) */}
          <div>
            <GlassCard className="h-full flex flex-col justify-between">
              <GlassCardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-extrabold text-foreground text-base">Instant Renewal</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pay directly with Safaricom M-Pesa STK Push
                </p>

                <form onSubmit={handleRenew} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      M-Pesa Number
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground font-mono focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Renewal Amount
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formatKES(plan.price)}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-emerald-500 font-extrabold"
                    />
                  </div>

                  {renewStatus && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] leading-snug font-semibold">
                      {renewStatus}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isRenewing}
                    className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition flex items-center justify-center gap-2 shadow-brand-btn"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isRenewing ? "Sending STK..." : "Pay Now via M-Pesa"}</span>
                  </button>
                </form>
              </GlassCardContent>

              <div className="p-4 border-t border-border bg-surface-elevated/40 text-[11px] text-muted-foreground space-y-1 font-mono">
                <div>Paybill: <span className="font-bold text-foreground">174379</span></div>
                <div>Account: <span className="font-bold text-primary">{customer.accountNumber}</span></div>
              </div>
            </GlassCard>
          </div>
        </div>

        <PortalSelfServicePanels
          accountNumber={customer.accountNumber}
          customerName={customer.fullName}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-subtle py-4 text-center text-xs text-muted-foreground">
        <p>Support Hotline: +254 712 345 678 &bull; Email: support@gtechisp.co.ke</p>
      </footer>
    </div>
  );
}
