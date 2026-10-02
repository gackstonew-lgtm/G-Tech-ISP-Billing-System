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
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import Link from "next/link";

export function Navbar({ title = "Operations Dashboard" }: { title?: string }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#0c1322]/90 backdrop-blur-md border-b border-slate-800/80">
        {/* Left: Mobile trigger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 md:gap-4">
          {/* Live RouterOS & AAA Engine Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>FreeRADIUS & WireGuard Online</span>
          </div>

          {/* Daraja M-Pesa Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Paybill 174379</span>
          </div>

          {/* Quick Pay / Hotspot test button */}
          <Link
            href="/captive"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-semibold hover:from-emerald-500 hover:to-teal-400 transition shadow-md shadow-emerald-900/30"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Captive Portal</span>
          </Link>

          {/* Notification icon */}
          <div className="relative">
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0c1322] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
