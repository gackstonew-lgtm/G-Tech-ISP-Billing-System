"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "destructive" | "neutral";
  size?: "sm" | "md";
}

export function GlassBadge({
  children,
  variant = "neutral",
  size = "md",
  className,
  ...props
}: GlassBadgeProps) {
  const variantStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    destructive: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    neutral: "bg-surface-elevated text-muted-foreground border-border",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 font-bold",
    md: "text-xs px-3 py-1 font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
