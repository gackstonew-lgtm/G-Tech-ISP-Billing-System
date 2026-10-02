"use client";

import React from "react";

interface NexaNetLogoProps {
  variant?: "full" | "stacked" | "horizontal" | "compact" | "icon";
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  className?: string;
  height?: number;
}

/**
 * Wi-Fi / House Network Icon
 * Permanently retains the electric brand blue color (#0066FF) in both light and dark themes.
 */
export function NexaNetIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* NexaNet Wi-Fi / Network Signal House Icon */}
      {/* Top right stem of N */}
      <path
        d="M115 32H165V168H120V80.5C104.5 96 95 117 95 140H70C70 105 87 74 115 54V32Z"
        fill="#0066FF"
      />
      {/* Outer Wi-Fi signal arc */}
      <path
        d="M32 32C107.1 32 168 92.9 168 168H126C126 116.1 83.9 74 32 74V32Z"
        fill="#0066FF"
      />
      {/* Inner Wi-Fi signal arc */}
      <path
        d="M32 90C75.1 90 110 124.9 110 168H76C76 143.7 56.3 124 32 124V90Z"
        fill="#0066FF"
      />
      {/* Network Signal Dot */}
      <circle cx="50" cy="150" r="16" fill="#0066FF" />
      {/* Right vertical tower bar */}
      <path
        d="M126 32H168V168H126V32Z"
        fill="#0066FF"
      />
    </svg>
  );
}

export function NexaNetLogo({
  variant = "horizontal",
  className = "",
  size = "md",
}: NexaNetLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
    custom: "",
  };

  if (variant === "icon") {
    return <NexaNetIcon className={`${sizeClasses[size]} ${className}`} />;
  }

  if (variant === "compact") {
    return (
      <div
        className={`flex items-center gap-2 select-none ${className}`}
        aria-label="NexaNet Technologies"
      >
        <NexaNetIcon className="w-7 h-7 shrink-0" />
        <div className="flex items-center tracking-tight font-extrabold text-sm sm:text-base leading-none">
          <span
            style={{ color: "var(--logo-nexa)" }}
            className="text-black dark:text-white transition-colors duration-200"
          >
            NexaNet
          </span>
        </div>
      </div>
    );
  }

  if (variant === "stacked" || variant === "full") {
    return (
      <div
        className={`flex flex-col items-center text-center select-none ${className}`}
        aria-label="NexaNet Technologies — ISP Network & Billing"
      >
        {/* Permanent Blue Wi-Fi Network Icon */}
        <NexaNetIcon className="w-16 h-16 sm:w-20 sm:h-20 mb-2.5 shrink-0" />
        
        {/* Theme-Adaptive Wordmark Typography */}
        <div className="flex items-center tracking-tight font-extrabold text-2xl sm:text-3xl leading-none">
          <span
            style={{ color: "var(--logo-nexa)" }}
            className="text-black dark:text-white transition-colors duration-200"
          >
            NexaNet
          </span>
        </div>

        {/* Theme-Adaptive Technologies Descriptor */}
        <div
          style={{ color: "var(--logo-tech)" }}
          className="font-extrabold text-black dark:text-white text-sm sm:text-base tracking-tight mt-1 transition-colors duration-200"
        >
          Technologies
        </div>

        {/* Theme-Adaptive ISP Sub-descriptor */}
        <div
          style={{ color: "var(--logo-sub)" }}
          className="flex items-center gap-2 font-bold text-black dark:text-[#E2E8F0] text-xs sm:text-sm tracking-wide mt-2 transition-colors duration-200"
        >
          <span className="w-4 h-0.5 bg-current inline-block rounded-full opacity-40"></span>
          <span>ISP Network &amp; Billing</span>
          <span className="w-4 h-0.5 bg-current inline-block rounded-full opacity-40"></span>
        </div>
      </div>
    );
  }

  // Default Horizontal Variant (Header / Navbar / Sidebar)
  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}
      aria-label="NexaNet Technologies — ISP Network & Billing"
    >
      <NexaNetIcon className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
      <div className="flex flex-col leading-tight">
        <div className="flex items-center tracking-tight font-extrabold text-base sm:text-lg">
          <span
            style={{ color: "var(--logo-nexa)" }}
            className="text-black dark:text-white transition-colors duration-200"
          >
            NexaNet
          </span>
          <span
            style={{ color: "var(--logo-tech)" }}
            className="font-bold text-xs sm:text-sm ml-1.5 text-black dark:text-white transition-colors duration-200"
          >
            Technologies
          </span>
        </div>
        <span
          style={{ color: "var(--logo-sub)" }}
          className="text-[10px] sm:text-[11px] font-bold text-black dark:text-[#E2E8F0] tracking-wider uppercase transition-colors duration-200"
        >
          ISP Network &amp; Billing
        </span>
      </div>
    </div>
  );
}
