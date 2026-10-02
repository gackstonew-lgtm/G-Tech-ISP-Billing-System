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
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";

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
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className={cn("flex flex-col h-full bg-surface border-r border-border text-foreground w-64 select-none transition-colors duration-200", className)}>
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 sm:h-20 border-b border-border bg-surface">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground group-hover:border-primary transition-all duration-200 shadow-xs">
            <Radio className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">
                G-Tech OS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Delta
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block truncate max-w-[130px]">
              ISP Network Suite
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
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
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
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
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Tenant Info & Theme Switcher */}
      <div className="p-3 border-t border-border bg-surface-subtle">
        <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center font-bold text-xs text-primary border border-border">
              BG
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">
                Baraka Gackstone
              </div>
              <div className="text-[10px] text-emerald-500 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                ISP Owner
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-surface-elevated transition border border-transparent hover:border-border"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
