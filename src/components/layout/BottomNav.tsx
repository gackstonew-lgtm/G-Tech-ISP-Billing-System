"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Router as RouterIcon,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

const PRIMARY_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Subscribers", icon: Users },
  { href: "/routers", label: "Network", icon: RouterIcon },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export function BottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Determine if active route is one of the secondary routes accessed via "More"
  const isSecondaryActive =
    !PRIMARY_NAV_ITEMS.some((item) => item.href === pathname) &&
    ["/plans", "/vouchers", "/technicians", "/monitoring", "/settings"].includes(pathname);

  return (
    <>
      {/* Slide-over Mobile Drawer for "More" Navigation */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-elevated border border-border text-foreground flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/80 dark:bg-[#090d16]/85 backdrop-blur-xl border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-all duration-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-all duration-150 relative",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 mb-1 transition-transform", isActive && "scale-110")} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* "More" Menu Button */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-all duration-150 relative",
              drawerOpen || isSecondaryActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Open secondary navigation items"
          >
            <Menu className={cn("w-5 h-5 mb-1 transition-transform", (drawerOpen || isSecondaryActive) && "scale-110")} />
            <span>More</span>
            {(drawerOpen || isSecondaryActive) && (
              <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
