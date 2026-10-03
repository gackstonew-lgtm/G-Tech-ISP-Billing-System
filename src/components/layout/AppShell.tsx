"use client";
import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  title?: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop: persistent sidebar. Tablet: drawer from the topbar. Phone: bottom bar. */}
      <div className="hidden shrink-0 lg:flex">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 space-y-4 overflow-y-auto p-4 pb-20 md:pb-6 lg:p-6">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
