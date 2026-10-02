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
  UserPlus,
  BarChart3,
  Globe,
  Settings,
  ChevronRight,
  X,
  Menu,
  FileText,
  Clock,
  Smartphone,
  Cpu,
  Database,
  ArrowUpRight,
  TrendingUp,
  Check,
} from "lucide-react";
import { WindowFrame } from "@/components/ui/WindowFrame";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/lib/auth/auth-context";
import { NexaNetLogo } from "@/components/ui/NexaNetLogo";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"PPPOE" | "HOTSPOT">("PPPOE");
  const { theme, toggleTheme } = useTheme();
  const { enterDemoMode, user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full transition-all duration-200 bg-background/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <NexaNetLogo variant="horizontal" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 bg-surface px-4 py-1.5 rounded-full border border-border shadow-xs">
              <a
                href="#platform"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                Platform
              </a>
              <a
                href="#how-it-works"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                Features
              </a>
              <a
                href="#architecture"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                Architecture
              </a>
              <a
                href="#comparison"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                Why NexaNet
              </a>
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
                href="/dashboard?demo=true"
                onClick={enterDemoMode}
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span>Explore Demo</span>
              </Link>

              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="inline-flex items-center px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-4 py-4 space-y-3">
            <a
              href="#platform"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-foreground py-2 border-b border-border-subtle"
            >
              Platform Overview
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-foreground py-2 border-b border-border-subtle"
            >
              How NexaNet Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-foreground py-2 border-b border-border-subtle"
            >
              Core Capabilities
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-foreground py-2 border-b border-border-subtle"
            >
              Technical Architecture
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/dashboard?demo=true"
                onClick={() => {
                  enterDemoMode();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500"
              >
                Explore Live Demo
              </Link>
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 text-xs font-bold text-primary-foreground bg-primary rounded-xl"
              >
                Get Started →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Value Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border shadow-xs text-xs font-bold text-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Your ISP. One Operating Platform.</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-primary">PPPoE • Hotspot • M-Pesa • MikroTik</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Run Your ISP From <br className="hidden sm:inline" />
              <span className="text-primary">One Powerful Platform</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              NexaNet Technologies brings subscriber management, PPPoE, hotspot billing,
              MikroTik fleet management, RADIUS accounting, M-Pesa payments, and live network operations
              together in one unified platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/sign-in"
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary-hover transition-all duration-200 shadow-xs flex items-center justify-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard?demo=true"
                onClick={enterDemoMode}
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-foreground bg-surface border border-border hover:bg-surface-elevated transition-all duration-200 rounded-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Explore Live Demo</span>
              </Link>
            </div>

            {/* Key Assurance Indicators */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>MikroTik RouterOS v7 &amp; v6</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Safaricom M-Pesa Express &amp; Paybill</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>FreeRADIUS Dual Authentication</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="mt-12 md:mt-16 max-w-5xl mx-auto">
            <WindowFrame urlPreview="nexanet.network/noc-live">
              <div className="p-4 sm:p-6 bg-surface space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">Active Subscribers</div>
                    <div className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
                      <AnimatedNumber value={1428} formatCommas={true} />
                    </div>
                    <div className="text-[10px] font-bold text-emerald-500 mt-0.5">↑ 12% this month</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">Monthly Revenue</div>
                    <div className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
                      <AnimatedNumber value={2.45} prefix="KES " suffix="M" decimals={2} />
                    </div>
                    <div className="text-[10px] font-bold text-emerald-500 mt-0.5">M-Pesa STK Verified</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">Active PPPoE Sessions</div>
                    <div className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
                      <AnimatedNumber value={1180} formatCommas={true} />
                    </div>
                    <div className="text-[10px] font-bold text-primary mt-0.5">FreeRADIUS Sync</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">MikroTik Fleet</div>
                    <div className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
                      <AnimatedNumber value={14} suffix=" Routers" />
                    </div>
                    <div className="text-[10px] font-bold text-emerald-500 mt-0.5">● 100% Online</div>
                  </div>
                </div>

                {/* Workflow Radar Row */}
                <div className="p-4 rounded-xl bg-surface-subtle border border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
                      01
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Subscriber Renewal Triggered</div>
                      <div className="text-muted-foreground text-[11px]">Account ACC-78912 • M-Pesa KES 2,500</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                    <span>STK Push Received</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>FreeRADIUS Updated</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Speed Profile 10Mbps Unlocked</span>
                  </div>
                </div>
              </div>
            </WindowFrame>
          </div>
        </div>
      </section>

      {/* "HOW NEXANET WORKS" SECTION */}
      <section id="how-it-works" className="py-16 md:py-24 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Complete ISP Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              How NexaNet Powers Your ISP Business
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              From physical network integration to automated M-Pesa payment collection and customer service renewal,
              NexaNet connects every operational stage.
            </p>
          </div>

          {/* 10 Step Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Connect Network",
                desc: "Link MikroTik routers via WireGuard or direct management IP.",
                icon: RouterIcon,
              },
              {
                step: "02",
                title: "Configure Services",
                desc: "Set up PPPoE and Hotspot bandwidth profiles with burst limits.",
                icon: Layers,
              },
              {
                step: "03",
                title: "Create Packages",
                desc: "Define daily, weekly, or monthly subscription tariffs in KES.",
                icon: CreditCard,
              },
              {
                step: "04",
                title: "Add Subscribers",
                desc: "Register customer profiles, account numbers, and POP sites.",
                icon: Users,
              },
              {
                step: "05",
                title: "Customer Connects",
                desc: "Subscribers connect via PPPoE credentials or Captive Portal.",
                icon: Wifi,
              },
              {
                step: "06",
                title: "Customer Pays",
                desc: "Instant payment via M-Pesa Express STK Push, Paybill, or Till.",
                icon: Smartphone,
              },
              {
                step: "07",
                title: "Account Updated",
                desc: "Ledger records transaction and balance automatically.",
                icon: Database,
              },
              {
                step: "08",
                title: "Service Activated",
                desc: "FreeRADIUS grants network access and updates session limits.",
                icon: Zap,
              },
              {
                step: "09",
                title: "Monitor Network",
                desc: "Real-time telemetry, active session counts, and network alerts.",
                icon: Activity,
              },
              {
                step: "10",
                title: "Analyze Business",
                desc: "Track revenue, churn, package popularity, and ARPU metrics.",
                icon: BarChart3,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-surface-subtle border border-border hover:border-primary/40 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                        {item.step}
                      </span>
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TECHNICAL ARCHITECTURE SECTION */}
      <section id="architecture" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <Cpu className="w-3.5 h-3.5" />
              <span>Technical Network Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Bridging Network Operations &amp; Commercial Billing
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              NexaNet operates between your network infrastructure and commercial payment systems,
              ensuring zero manual provisioning bottlenecks.
            </p>
          </div>

          {/* Flow Diagram Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                <Server className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-extrabold text-sm text-foreground">MikroTik Fleet</div>
                <div className="text-[11px] text-muted-foreground mt-1">API &amp; WireGuard Tunnel</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                <Database className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-extrabold text-sm text-foreground">FreeRADIUS Engine</div>
                <div className="text-[11px] text-muted-foreground mt-1">rlm_sql PostgreSQL Auth</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                <CreditCard className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-extrabold text-sm text-foreground">M-Pesa Integration</div>
                <div className="text-[11px] text-muted-foreground mt-1">Express STK &amp; Paybill C2B</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-primary">
                NexaNet Operating System Core
              </div>
              <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                Subscribers • Service Plans • Invoices • Active Sessions • Field Work Orders • Real-time Telemetry
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PLATFORM CAPABILITIES */}
      <section id="features" className="py-16 md:py-24 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Core Platform Modules</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Everything Needed to Run a Broadband ISP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Network Operations",
                desc: "MikroTik router fleet management, WireGuard VPN tunnels, IP pool allocation, active session disconnects, and network alerts.",
                icon: RouterIcon,
              },
              {
                title: "Billing & Payments",
                desc: "Automated M-Pesa STK Push callbacks, Paybill C2B reconciliation, invoice generation, and grace period suspensions.",
                icon: CreditCard,
              },
              {
                title: "Subscriber Management",
                desc: "Complete CRM for PPPoE and Hotspot accounts, installation addresses, contact records, and service history.",
                icon: Users,
              },
              {
                title: "Hotspot & Vouchers",
                desc: "Customizable Captive Portal, instant voucher batch generation, time-based access control, and usage caps.",
                icon: Wifi,
              },
              {
                title: "Business Analytics",
                desc: "Live revenue reporting, active session graphs, subscriber growth rate, churn metrics, and ARPU analytics.",
                icon: BarChart3,
              },
              {
                title: "Customer Self-Care",
                desc: "Subscribers can check package expiration, make M-Pesa renewals directly, view invoices, and request support.",
                icon: Smartphone,
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-surface-subtle border border-border hover:border-primary/40 transition-all duration-200 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-foreground">{card.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRADITIONAL VS NEXANET COMPARISON */}
      <section id="comparison" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              One Unified Platform Instead of Multiple Disconnected Tools
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Stop juggling Excel spreadsheets, WinBox, manual M-Pesa statements, and WhatsApp customer chats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-red-500/20 space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-red-500">
                Traditional Fragmented Workflow
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground font-semibold">
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Manual WinBox static IP &amp; profile assignments</span>
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Checking M-Pesa SMS statements manually on phone</span>
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Excel spreadsheets for customer balance tracking</span>
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Forgotten expirations leading to unpaid internet usage</span>
                </li>
              </ul>
            </div>

            {/* NexaNet */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-emerald-500/30 space-y-4 shadow-xs">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                NexaNet Unified Operating System
              </div>
              <ul className="space-y-3 text-xs text-foreground font-semibold">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Automated FreeRADIUS &amp; MikroTik provisioning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time M-Pesa STK Push &amp; Paybill callbacks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Centralized PostgreSQL multi-tenant database</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant automated suspension &amp; service renewal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-16 md:py-24 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Ready to Simplify Your ISP Operations?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Connect your network, manage subscribers, automate M-Pesa billing, and give your customers a better way to manage their internet service.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/sign-in"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard?demo=true"
              onClick={enterDemoMode}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-foreground bg-surface-elevated border border-border hover:bg-surface transition-colors rounded-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Explore Live Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-background border-t border-border text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NexaNetLogo variant="horizontal" />
          </div>
          <div>
            &copy; {new Date().getFullYear()} NexaNet Technologies Ltd. All rights reserved. ISP Network &amp; Billing Platform.
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="hover:text-foreground">Sign In</Link>
            <Link href="/register" className="hover:text-foreground">Register</Link>
            <Link href="/dashboard?demo=true" onClick={enterDemoMode} className="hover:text-foreground">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
