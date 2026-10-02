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
  Sun,
  Moon,
  LogOut,
  Sparkles,
  LogIn,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/lib/auth/auth-context";
import { NexaNetLogo } from "@/components/ui/NexaNetLogo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Subscribers", icon: Users },
  { href: "/routers", label: "MikroTik Fleet", icon: RouterIcon },
  { href: "/plans", label: "Service Plans", icon: Layers },
  { href: "/vouchers", label: "Hotspot Vouchers", icon: Ticket },
  { href: "/billing", label: "Billing & M-Pesa", icon: CreditCard },
  { href: "/technicians", label: "Field Operations", icon: Wrench },
  { href: "/monitoring", label: "Live Telemetry", icon: Activity },
  { href: "/settings", label: "Settings & Config", icon: Settings },
];

const EXTERNAL_LINKS = [
  { href: "/portal", label: "Customer Self-Care", icon: UserCheck },
  { href: "/captive", label: "Captive Portal Demo", icon: Wifi },
];

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, organization, isDemoMode, signOut, exitDemoMode } = useAuth();

  const userInitials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "NN";

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-surface border-r border-border text-foreground w-64 select-none transition-colors duration-200",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 sm:h-20 border-b border-border bg-surface">
        <Link href="/" className="flex items-center group">
          <NexaNetLogo variant="horizontal" />
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            <span>ISP Operations</span>
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
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
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
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer User Profile / Demo Banner & Theme Switcher */}
      <div className="p-3 border-t border-border bg-surface-subtle space-y-2">
        {isDemoMode ? (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-amber-500 text-[11px] truncate">
                  Demo Mode Active
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  Viewing isolated sample dataset
                </div>
              </div>
            </div>
            <button
              onClick={exitDemoMode}
              className="w-full py-1.5 px-2.5 rounded-lg bg-surface hover:bg-surface-elevated border border-border text-foreground font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-primary" />
              <span>Sign In for Real Account</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center font-bold text-xs text-primary border border-border shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground truncate">
                  {profile?.full_name || user?.email || "ISP Administrator"}
                </div>
                <div className="text-[10px] text-emerald-500 flex items-center gap-1 font-semibold truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="capitalize">{profile?.role?.replace("_", " ") || "ISP Owner"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={signOut}
                title="Sign Out"
                className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-lg hover:bg-surface-elevated transition border border-transparent hover:border-border"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-surface-elevated transition border border-transparent hover:border-border"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
