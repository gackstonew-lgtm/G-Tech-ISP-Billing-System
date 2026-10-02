"use client";
import React, { useState } from "react";
import {
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Zap,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";

export function Navbar({ title = "Operations Dashboard" }: { title?: string }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 sm:h-20 px-4 md:px-8 bg-surface/80 backdrop-blur-md border-b border-border-subtle transition-colors duration-200">
        {/* Left: Mobile trigger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Live FreeRADIUS Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border text-foreground text-xs font-semibold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>FreeRADIUS &amp; WireGuard Live</span>
          </div>

          {/* Daraja M-Pesa Status */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-foreground">Paybill 174379</span>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated hover:border-primary/50 transition-all duration-200 shadow-xs"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          {/* Captive Portal Quick Action */}
          <Link
            href="/captive"
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-200 shadow-brand-btn"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Captive Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
