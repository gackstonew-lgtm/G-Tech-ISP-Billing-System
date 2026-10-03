"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { GTechLogo } from "@/components/ui/GTechLogo";
import { ALL_NAV_ITEMS } from "./nav";

export function Sidebar({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      onClose?.();
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

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

      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-2.5 py-3">
        <ul className="space-y-1">
          {ALL_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                    isActive
                      ? "bg-primary-soft font-medium text-primary"
                      : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <span
                      className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-2.5">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isSigningOut}
          aria-label="Log out"
          className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-60"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{isSigningOut ? "Logging out…" : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
