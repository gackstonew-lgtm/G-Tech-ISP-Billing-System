"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Sun, Moon, FlaskConical, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/lib/auth/auth-context";
import { GTechLogo } from "@/components/ui/GTechLogo";
import { NAV_GROUPS } from "./nav";

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, isDemoMode, signOut, exitDemoMode } = useAuth();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const displayName = profile?.full_name || user?.email || "Administrator";
  const initials = displayName
    .split(/[\s@]/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside
      aria-label="Primary"
      className={cn(
        "flex h-full w-60 select-none flex-col border-r border-border bg-surface text-foreground",
        className
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/dashboard" onClick={onClose} className="rounded-md">
          <GTechLogo />
        </Link>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => {
          const isCollapsed = collapsed[group.id];
          const hasActive = group.items.some((i) => i.href === pathname);
          // Never hide the group that contains the current page
          const open = !isCollapsed || hasActive;
          return (
            <div key={group.id}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setCollapsed((c) => ({ ...c, [group.id]: !c[group.id] }))}
                className="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                <span>{group.label}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !open && "-rotate-90")} aria-hidden="true" />
              </button>
              {open && (
                <ul className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "relative flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
                            isActive
                              ? "bg-primary-soft font-medium text-primary"
                              : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                          )}
                        >
                          {isActive && (
                            <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" aria-hidden="true" />
                          )}
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border p-2">
        {isDemoMode && (
          <div className="rounded-md border border-warning/30 bg-warning-soft p-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-warning">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              Demo data
            </div>
            <p className="mt-0.5 text-muted-foreground">Sample dataset. Nothing here is real.</p>
            <button
              onClick={exitDemoMode}
              className="mt-1.5 inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-elevated"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              Sign in to a real account
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-md px-1.5 py-1">
          <div
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-elevated text-xs font-semibold text-foreground"
          >
            {initials || "GT"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium leading-4">{displayName}</div>
            <div className="truncate text-xs capitalize text-muted-foreground">
              {profile?.role?.replace(/_/g, " ") || (isDemoMode ? "Demo viewer" : "Operator")}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {!isDemoMode && user && (
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-danger-soft hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
