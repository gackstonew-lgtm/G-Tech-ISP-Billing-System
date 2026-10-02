"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  hoverEffect?: boolean;
}

export function GlassCard({
  children,
  className,
  elevated = false,
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface text-foreground shadow-sm overflow-hidden transition-all duration-200",
        elevated && "bg-surface-elevated/70",
        hoverEffect && "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border bg-surface-elevated/60 px-4 sm:px-6 py-3.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 sm:p-6", className)} {...props}>
      {children}
    </div>
  );
}
