"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Router as RouterIcon,
  Layers,
  CreditCard,
  Ticket,
  Wrench,
  Activity,
  UserCheck,
  Wifi,
  Settings,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard (NOC)", icon: LayoutDashboard },
  { href: "/customers", label: "Subscribers", icon: Users },
  { href: "/routers", label: "MikroTik Fleet", icon: RouterIcon },
  { href: "/plans", label: "Service Plans", icon: Layers },
  { href: "/vouchers", label: "Hotspot Vouchers", icon: Ticket },
  { href: "/billing", label: "Billing & M-Pesa", icon: CreditCard },
  { href: "/technicians", label: "Field Operations", icon: Wrench },
  { href: "/monitoring", label: "Live Telemetry", icon: Activity },
];

const EXTERNAL_LINKS = [
  { href: "/portal", label: "Customer Self-Care", icon: UserCheck },
  { href: "/captive", label: "Captive Portal Demo", icon: Wifi },
];

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex flex-col h-full bg-[#0c1322] border-r border-slate-800/80 text-slate-300 w-64 select-none", className)}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80 bg-[#0c1322]/50">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-lg shadow-sky-500/20 font-bold">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="font-bold text-white tracking-tight text-base flex items-center gap-1.5">
            G-Tech OS
            <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              v1.0
            </span>
          </div>
          <div className="text-xs text-slate-400 truncate max-w-[140px]">
            G-Tech Fiber Ltd
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            ISP Operations
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-sky-600/15 text-sky-400 border border-sky-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Subscriber Experience
          </div>
          <nav className="space-y-1">
            {EXTERNAL_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-sky-600/15 text-sky-400 border border-sky-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Tenant Info */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080d18]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-sky-400 border border-slate-600">
              BG
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">
                Baraka Gackstone
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ISP Owner
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
