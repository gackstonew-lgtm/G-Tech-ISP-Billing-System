"use client";

import React, { useState } from "react";
import {
  Menu,
  X,
  Zap,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/lib/auth/auth-context";

const SHORTENED_TITLES: Record<string, string> = {
  "Executive Operations & Revenue": "Operations",
  "Operations Dashboard": "Operations",
  "Subscribers & Customer CRM": "Subscribers",
  "MikroTik Fleet Management": "MikroTik",
  "Hotspot Vouchers": "Vouchers",
  "Billing & M-Pesa": "Billing",
  "Field Operations": "Field Ops",
  "Live Network Telemetry & Monitoring": "Monitoring",
  "Settings & Config": "Settings",
  "Customer Self-Care": "Self-Care",
  "Captive Portal": "Captive",
};

export function Navbar({ title = "Operations Dashboard" }: { title?: string }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, isDemoMode, exitDemoMode, signOut } = useAuth();

  const shortenedTitle = SHORTENED_TITLES[title] || title;

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 sm:h-20 px-4 md:px-8 bg-surface/80 backdrop-blur-md border-b border-border-subtle transition-colors duration-200">
        {/* Left: Mobile trigger & Page Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden w-9 h-9 shrink-0 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 truncate">
            <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2 truncate">
              <span className="sm:hidden truncate">{shortenedTitle}</span>
              <span className="hidden sm:inline truncate">{title}</span>
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Mode Indicator Badge */}
          {isDemoMode ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Mode</span>
            </div>
          ) : user ? (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border text-foreground text-xs font-semibold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[150px]">{profile?.full_name || user.email}</span>
            </div>
          ) : null}

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated hover:border-primary/50 transition-all duration-200 shadow-xs"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </button>

          {/* User Sign In / Sign Out or Captive Action */}
          {isDemoMode ? (
            <Link
              href="/sign-in"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-200 shadow-brand-btn"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          ) : user ? (
            <button
              onClick={signOut}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-elevated border border-border text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-200 shadow-brand-btn"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-elevated border border-border text-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
