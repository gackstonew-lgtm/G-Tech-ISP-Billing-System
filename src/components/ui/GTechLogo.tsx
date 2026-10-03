import React from "react";
import { cn } from "@/lib/utils";

/** G-Tech wordmark. Simple geometric mark + text; no external assets. */
export function GTechLogo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold leading-none text-primary-foreground"
      >
        G
      </span>
      {showText && (
        <span className="text-sm font-semibold leading-none tracking-tight text-foreground">
          G-Tech <span className="font-normal text-muted-foreground">ISP</span>
        </span>
      )}
    </span>
  );
}
