"use client";
import React, { useState } from "react";
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
  Lock,
  Search,
  Sparkles,
  MapPin,
  Phone,
  Sun,
  Moon,
  LogIn,
} from "lucide-react";
import { WindowFrame } from "@/components/ui/WindowFrame";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"PPPOE" | "HOTSPOT">("PPPOE");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full transition-all duration-200 bg-background/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground group-hover:border-primary transition-all duration-200 shadow-xs">
                <Radio className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg sm:text-xl text-foreground tracking-tight">
                    G-Tech
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    Delta
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  ISP Network &amp; Billing Suite
                </p>
              </div>
            </Link>

            {/* Pill Navigation */}
            <nav className="hidden md:flex items-center space-x-1 bg-surface px-3 py-1.5 rounded-full border border-border shadow-xs">
              <Link
                href="/dashboard"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                NOC Dashboard
              </Link>
              <Link
                href="/customers"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                Subscribers
              </Link>
              <Link
                href="/routers"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                MikroTik Fleet
              </Link>
              <Link
                href="/vouchers"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                Vouchers
              </Link>
            </nav>

            {/* Right Header Controls */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated hover:border-primary/50 transition-all duration-200 shadow-xs"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
              </button>

              <Link
                href="/portal"
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold text-foreground hover:text-primary transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                <span>Subscriber Care</span>
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-200 shadow-brand-btn"
              >
                <span>Launch NOC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full">
        <section className="relative isolate overflow-hidden pt-8 sm:pt-14 pb-16 sm:pb-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              {/* Pill Mini Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-xs">
                <Search className="w-3.5 h-3.5 text-primary" />
                <span>Next-Gen Kenyan ISP Operating System</span>
              </div>

              {/* Bold Multi-Line Typography */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Automate Networks. <br />
                Manage Subscribers. <span className="text-primary">Move Faster.</span>
              </h1>

              {/* Lead Paragraph */}
              <p className="max-w-2xl mx-auto text-base sm:text-xl font-medium text-muted-foreground leading-relaxed">
                G-Tech OS combines MikroTik RouterOS automation, FreeRADIUS AAA rate-limiting, WireGuard tunnels, and instant Safaricom M-Pesa STK billing in one unified workspace.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground h-12 px-7 text-sm font-bold transition-all duration-200 group shadow-brand-btn"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/captive"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-surface hover:bg-surface-elevated text-foreground border border-border h-12 px-7 text-sm font-semibold transition-all duration-200 shadow-xs"
                >
                  <span>Test Captive WiFi</span>
                </Link>
              </div>
            </div>

            {/* Interactive Browser Window Mockup (WebHunt Style) */}
            <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
              <WindowFrame
                urlPreview="gtech.isp/radar/noc"
                tabs={[
                  {
                    label: "Fiber PPPoE Radar",
                    active: activeTab === "PPPOE",
                    onClick: () => setActiveTab("PPPOE"),
                  },
                  {
                    label: "Hotspot WiFi Radar",
                    active: activeTab === "HOTSPOT",
                    onClick: () => setActiveTab("HOTSPOT"),
                  },
                ]}
              >
                <div className="p-5 sm:p-7 space-y-5 bg-surface">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-border">
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {activeTab === "PPPOE" ? "Active Fiber Subscribers Radar" : "Hotspot WiFi Session Radar"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Real-time MikroTik session accounting, queue rates, and M-Pesa billing verification
                      </div>
                    </div>
                    <GlassBadge variant="primary" size="md">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live FreeRADIUS Scan</span>
                    </GlassBadge>
                  </div>

                  {/* Feed Items */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-elevated/50 border border-border hover:border-primary/50 transition-all gap-4">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-border text-primary flex items-center justify-center shrink-0 shadow-xs">
                          <RouterIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-foreground truncate">
                              John Kamau Mwangi
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                              10 Mbps Online
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1 font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Kilimani POP • IP 10.10.12.45
                            </span>
                            <span className="flex items-center gap-1 text-foreground">
                              <Phone className="w-3 h-3" /> 0799112233
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                          M-Pesa: RKF9283KDJ
                        </span>
                        <Link
                          href="/customers"
                          className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-xs font-semibold text-foreground transition-colors"
                        >
                          Inspect
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-elevated/50 border border-border hover:border-primary/50 transition-all gap-4">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-border text-primary flex items-center justify-center shrink-0 shadow-xs">
                          <Wifi className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-foreground truncate">
                              Grace Njeri Otieno
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                              20 Mbps Static
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1 font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Westlands POP • IP 10.10.10.14
                            </span>
                            <span className="flex items-center gap-1 text-foreground">
                              <Phone className="w-3 h-3" /> 0712987654
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                          M-Pesa: RKF8841LPS
                        </span>
                        <Link
                          href="/customers"
                          className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-xs font-semibold text-foreground transition-colors"
                        >
                          Inspect
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </WindowFrame>
            </div>

            {/* 3 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 transition duration-300 group flex flex-col justify-between shadow-xl">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition duration-200">
                    <RouterIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                    ISP Admin &amp; NOC
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Manage subscribers, MikroTik fleet, speed plans, WireGuard tunnels, financial ledgers, and real-time network telemetry.
                  </p>
                  <ul className="space-y-2 text-xs text-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>MikroTik v6/v7 Zero-Touch Provisioning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>FreeRADIUS Rate-Limiting &amp; CoA Disconnect</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Batch Hotspot Voucher Generator &amp; POS Print</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/dashboard"
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition flex items-center justify-center gap-2 shadow-brand-btn"
                >
                  <span>Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 transition duration-300 group flex flex-col justify-between shadow-xl">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition duration-200">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                    Hotspot Captive Portal
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Ultra-fast captive portal for public WiFi zones with packages (1Hr, 3Hr, 24Hr, Weekly, Monthly) and instant M-Pesa STK checkout.
                  </p>
                  <ul className="space-y-2 text-xs text-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Instant 1-Click M-Pesa STK Push Login</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Voucher Code Card Redemption</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Optimized for low-end Android devices</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/captive"
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-elevated text-foreground border border-border font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Open Captive Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 transition duration-300 group flex flex-col justify-between shadow-xl">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition duration-200">
                    <Users className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                    Customer Self-Care
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Dedicated subscriber dashboard allowing home and business fiber customers to check speed, view usage, and pay via M-Pesa.
                  </p>
                  <ul className="space-y-2 text-xs text-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Live Expiry Counter &amp; Grace Period Alert</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>1-Click Subscription Renewal via STK</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Invoice &amp; Payment Receipt Downloads</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/portal"
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-elevated text-foreground border border-border font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Subscriber Self-Care</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Metrics Statistics Strip */}
            <div className="border-t border-border mt-16 pt-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
                  <div className="text-2xl sm:text-3xl font-extrabold text-primary">99.98%</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">FreeRADIUS AAA Uptime</div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500">&lt; 2.5s</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">M-Pesa STK Reconnect</div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
                  <div className="text-2xl sm:text-3xl font-extrabold text-primary">WireGuard</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">Encrypted Router Control</div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">Postgres RLS</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">Multi-Tenant Isolation</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-subtle py-6 text-center text-xs text-muted-foreground">
        <p>&copy; 2025 G-Tech ISP Operating System. Built for East African ISPs, WISPs &amp; Community Hotspot Networks.</p>
      </footer>
    </div>
  );
}
