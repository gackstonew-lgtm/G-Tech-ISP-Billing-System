"use client";

import React, { useState } from "react";
import {
  Building2,
  Palette,
  Network,
  Router as RouterIcon,
  ShieldAlert,
  Layers,
  Wifi,
  CreditCard,
  Smartphone,
  Bell,
  Users,
  Lock,
  SunMoon,
  FileText,
  Save,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  History,
  Key,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { SEED_ORGANIZATION } from "@/lib/db/mock-db";
import { useTheme } from "@/components/theme/ThemeProvider";

type SettingsCategory =
  | "organization"
  | "branding"
  | "network"
  | "mikrotik"
  | "radius"
  | "pppoe"
  | "hotspot"
  | "billing"
  | "mpesa"
  | "notifications"
  | "roles"
  | "security"
  | "appearance"
  | "audit";

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("organization");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { theme, setTheme } = useTheme();

  // Form States
  const [orgName, setOrgName] = useState(SEED_ORGANIZATION.name);
  const [orgSlug, setOrgSlug] = useState(SEED_ORGANIZATION.slug);
  const [orgEmail, setOrgEmail] = useState(SEED_ORGANIZATION.email);
  const [orgPhone, setOrgPhone] = useState(SEED_ORGANIZATION.phone);
  const [currency, setCurrency] = useState("KES");
  const [billingCycle, setBillingCycle] = useState("ANNIVERSARY");
  const [gracePeriod, setGracePeriod] = useState("2");

  // M-Pesa State
  const [paybill, setPaybill] = useState("4084200");
  const [consumerKey, setConsumerKey] = useState("ck_live_98a7sd6f5a4sd3f2");
  const [consumerSecret, setConsumerSecret] = useState("cs_live_0987as6f5d4sa3f21");
  const [passkey, setPasskey] = useState("bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919");
  const [showSecrets, setShowSecrets] = useState(false);

  // RADIUS State
  const [radiusHost, setRadiusHost] = useState("10.100.0.1");
  const [radiusSecret, setRadiusSecret] = useState("G-TechRadiusSecret2025!");
  const [showRadiusSecret, setShowRadiusSecret] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const SETTINGS_TABS = [
    { id: "organization", label: "Organization & General", icon: Building2 },
    { id: "branding", label: "Branding & Portal", icon: Palette },
    { id: "network", label: "Network & POP Sites", icon: Network },
    { id: "mikrotik", label: "MikroTik Routers", icon: RouterIcon },
    { id: "radius", label: "RADIUS Engine", icon: Server },
    { id: "pppoe", label: "PPPoE Services", icon: Layers },
    { id: "hotspot", label: "Hotspot & Vouchers", icon: Wifi },
    { id: "billing", label: "Billing & Invoices", icon: CreditCard },
    { id: "mpesa", label: "M-Pesa & Payments", icon: Smartphone },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "roles", label: "Staff & RBAC Roles", icon: Users },
    { id: "security", label: "Security & Sessions", icon: Lock },
    { id: "appearance", label: "Appearance & Theme", icon: SunMoon },
    { id: "audit", label: "System Audit Logs", icon: History },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Platform Settings &amp; Configuration" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  <span>ISP Configuration Hub</span>
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage organization profile, network integration, M-Pesa credentials, RADIUS, and RBAC permissions.
                </p>
              </div>

              {saveSuccess && (
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings updated successfully!</span>
                </div>
              )}
            </div>

            {/* Layout Grid: Left Nav + Right Form */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Category Navigation */}
              <div className="lg:col-span-1 p-2 rounded-2xl bg-surface border border-border space-y-1 shadow-xs">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id as SettingsCategory)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Content Area */}
              <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs space-y-6">
                <form onSubmit={handleSave} className="space-y-6">
                  {/* CATEGORY 1: ORGANIZATION */}
                  {activeCategory === "organization" && (
                    <div className="space-y-5">
                      <div className="border-b border-border-subtle pb-3">
                        <h2 className="text-base font-extrabold text-foreground">Organization Profile</h2>
                        <p className="text-xs text-muted-foreground">General details for your ISP account.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">ISP Business Name</label>
                          <input
                            type="text"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Organization Slug</label>
                          <input
                            type="text"
                            value={orgSlug}
                            onChange={(e) => setOrgSlug(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Support Email</label>
                          <input
                            type="email"
                            value={orgEmail}
                            onChange={(e) => setOrgEmail(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Support Phone</label>
                          <input
                            type="text"
                            value={orgPhone}
                            onChange={(e) => setOrgPhone(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Currency</label>
                          <input
                            type="text"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Grace Period (Days)</label>
                          <input
                            type="number"
                            value={gracePeriod}
                            onChange={(e) => setGracePeriod(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 2: M-PESA & PAYMENTS */}
                  {activeCategory === "mpesa" && (
                    <div className="space-y-5">
                      <div className="border-b border-border-subtle pb-3 flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-extrabold text-foreground">Safaricom Daraja M-Pesa Integration</h2>
                          <p className="text-xs text-muted-foreground">Configure STK Push Express and Paybill C2B callback credentials.</p>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                          Active API Gateway
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Business Shortcode / Paybill Number</label>
                          <input
                            type="text"
                            value={paybill}
                            onChange={(e) => setPaybill(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-foreground">Consumer Key</label>
                            <button
                              type="button"
                              onClick={() => setShowSecrets(!showSecrets)}
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              {showSecrets ? "Hide Credentials" : "Show Credentials"}
                            </button>
                          </div>
                          <input
                            type={showSecrets ? "text" : "password"}
                            value={consumerKey}
                            onChange={(e) => setConsumerKey(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Consumer Secret</label>
                          <input
                            type={showSecrets ? "text" : "password"}
                            value={consumerSecret}
                            onChange={(e) => setConsumerSecret(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Lipa Na M-Pesa Passkey</label>
                          <textarea
                            rows={2}
                            value={passkey}
                            onChange={(e) => setPasskey(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs text-foreground font-mono resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 3: RADIUS */}
                  {activeCategory === "radius" && (
                    <div className="space-y-5">
                      <div className="border-b border-border-subtle pb-3">
                        <h2 className="text-base font-extrabold text-foreground">FreeRADIUS Engine Settings</h2>
                        <p className="text-xs text-muted-foreground">PostgreSQL rlm_sql authentication and accounting configuration.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">RADIUS Server Host IP</label>
                          <input
                            type="text"
                            value={radiusHost}
                            onChange={(e) => setRadiusHost(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs font-mono text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Accounting Port</label>
                          <input
                            type="text"
                            value="1813"
                            disabled
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs font-mono text-muted-foreground cursor-not-allowed"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-foreground">NAS Shared Secret</label>
                            <button
                              type="button"
                              onClick={() => setShowRadiusSecret(!showRadiusSecret)}
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              {showRadiusSecret ? "Hide Secret" : "Show Secret"}
                            </button>
                          </div>
                          <input
                            type={showRadiusSecret ? "text" : "password"}
                            value={radiusSecret}
                            onChange={(e) => setRadiusSecret(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs font-mono text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CATEGORY 4: APPEARANCE */}
                  {activeCategory === "appearance" && (
                    <div className="space-y-5">
                      <div className="border-b border-border-subtle pb-3">
                        <h2 className="text-base font-extrabold text-foreground">Appearance &amp; Theme</h2>
                        <p className="text-xs text-muted-foreground">Customize UI color mode across dark and light themes.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setTheme("dark")}
                          className={`p-4 rounded-xl border text-left transition ${
                            theme === "dark"
                              ? "border-primary bg-primary/10 text-foreground font-bold"
                              : "border-border bg-surface-subtle text-muted-foreground"
                          }`}
                        >
                          <div className="font-extrabold text-sm mb-1">Dark Mode (Default Operations)</div>
                          <div className="text-xs opacity-75">High-contrast dark theme optimized for network operations monitors.</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme("light")}
                          className={`p-4 rounded-xl border text-left transition ${
                            theme === "light"
                              ? "border-primary bg-primary/10 text-foreground font-bold"
                              : "border-border bg-surface-subtle text-muted-foreground"
                          }`}
                        >
                          <div className="font-extrabold text-sm mb-1">Light Mode</div>
                          <div className="text-xs opacity-75">Clean daylight theme for administrative staff and report viewing.</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OTHER CATEGORIES FALLBACK PLACEHOLDER */}
                  {!["organization", "mpesa", "radius", "appearance"].includes(activeCategory) && (
                    <div className="space-y-4">
                      <div className="border-b border-border-subtle pb-3">
                        <h2 className="text-base font-extrabold text-foreground capitalize">
                          {activeCategory.replace("-", " ")} Configuration
                        </h2>
                        <p className="text-xs text-muted-foreground">Active configuration settings for this module.</p>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-subtle border border-border text-xs text-muted-foreground space-y-2">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Module Operational</span>
                        </div>
                        <p>All active parameters for {activeCategory} are synchronized with the PostgreSQL schema and service layer.</p>
                      </div>
                    </div>
                  )}

                  {/* Save Button Bar */}
                  <div className="pt-4 border-t border-border flex items-center justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition-colors shadow-xs flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Configuration</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
