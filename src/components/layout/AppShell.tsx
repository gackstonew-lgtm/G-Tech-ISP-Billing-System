"use client";
import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface AppShellProps {
  title?: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#090d16] text-slate-100">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
