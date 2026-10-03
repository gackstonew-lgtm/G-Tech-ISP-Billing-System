"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, CornerDownLeft } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ALL_NAV_ITEMS } from "./nav";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

/** Jump-to-page search. Navigates only to real routes defined in nav.ts. */
function QuickJump() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const results = q
    ? ALL_NAV_ITEMS.filter((i) => `${i.label} ${i.keywords ?? ""}`.toLowerCase().includes(q)).slice(0, 6)
    : [];

  // "/" focuses the search, like most ops consoles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  };

  return (
    <div className="relative hidden w-64 sm:block">
      <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="quickjump-list"
        aria-label="Jump to page"
        placeholder="Jump to page…  ( / )"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            go(results[active].href);
          } else if (e.key === "Escape") {
            setQuery("");
            inputRef.current?.blur();
          }
        }}
        className="h-9 w-full rounded-md border border-border bg-surface-subtle pl-8 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      {open && q && (
        <ul
          id="quickjump-list"
          role="listbox"
          className="absolute left-0 right-0 top-10 z-50 overflow-hidden rounded-md border border-border bg-popover py-1 shadow-[var(--shadow-pop)]"
        >
          {results.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">No matching page</li>}
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <li key={r.href} role="option" aria-selected={i === active}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(r.href)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
                    i === active ? "bg-surface-elevated text-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{r.label}</span>
                  {i === active && <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Navbar({ title = "Dashboard" }: { title?: string }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { isDemoMode } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="-ml-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-surface-elevated md:flex lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">{title}</h1>
          {isDemoMode && (
            <span className="shrink-0 rounded-md border border-warning/30 bg-warning-soft px-1.5 py-0.5 text-xs font-medium text-warning">
              Demo data
            </span>
          )}
        </div>
        <QuickJump />
      </header>

      {/* Tablet drawer (phones use the bottom bar instead; desktop has the persistent sidebar) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 hidden md:flex lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative z-10 flex h-full shadow-[var(--shadow-pop)]">
            <Sidebar onClose={() => setDrawerOpen(false)} />
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-elevated"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
