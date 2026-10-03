"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Activity,
  Globe,
  Gauge,
  Network,
  Sparkles,
  ArrowUpRight,
  Wrench,
  ChevronRight,
} from "lucide-react";

const SpeedTestTool = dynamic(
  () => import("./SpeedTestTool").then((m) => m.SpeedTestTool),
  {
    loading: () => (
      <div className="h-56 rounded-2xl bg-surface-subtle border border-border animate-pulse" />
    ),
  }
);

const WhatIsMyIpTool = dynamic(
  () => import("./WhatIsMyIpTool").then((m) => m.WhatIsMyIpTool),
  {
    loading: () => (
      <div className="h-56 rounded-2xl bg-surface-subtle border border-border animate-pulse" />
    ),
  }
);

const BandwidthCalculatorTool = dynamic(
  () =>
    import("./BandwidthCalculatorTool").then((m) => m.BandwidthCalculatorTool),
  {
    loading: () => (
      <div className="h-56 rounded-2xl bg-surface-subtle border border-border animate-pulse" />
    ),
  }
);

const SubnetCalculatorTool = dynamic(
  () => import("./SubnetCalculatorTool").then((m) => m.SubnetCalculatorTool),
  {
    loading: () => (
      <div className="h-56 rounded-2xl bg-surface-subtle border border-border animate-pulse" />
    ),
  }
);

export type FreeToolId =
  | "speed-test"
  | "what-is-my-ip"
  | "bandwidth-calculator"
  | "subnet-calculator";

interface FreeToolsSectionProps {
  activeTool?: FreeToolId;
  onSelectTool?: (tool: FreeToolId) => void;
  onEnterDemo: () => void;
}

export function FreeToolsSection({
  activeTool: controlledTool,
  onSelectTool,
  onEnterDemo,
}: FreeToolsSectionProps) {
  const [internalTool, setInternalTool] = useState<FreeToolId>("speed-test");
  const activeTool = controlledTool ?? internalTool;

  const handleSelectTool = (tool: FreeToolId) => {
    setInternalTool(tool);
    onSelectTool?.(tool);
  };

  const interactiveTools: Array<{
    id: FreeToolId;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: "speed-test",
      title: "Speed Test",
      description: "Download, upload, ping and jitter in one run",
      icon: Activity,
    },
    {
      id: "what-is-my-ip",
      title: "What Is My IP",
      description: "Your public IP address and who it belongs to",
      icon: Globe,
    },
    {
      id: "bandwidth-calculator",
      title: "Bandwidth Calculator",
      description: "Size an upstream before you buy it",
      icon: Gauge,
    },
    {
      id: "subnet-calculator",
      title: "Subnet Calculator",
      description: "Split an IPv4 block and read off its hosts",
      icon: Network,
    },
  ];

  return (
    <section
      id="free-tools"
      className="py-16 md:py-24 bg-background border-t border-border scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Wrench className="w-3.5 h-3.5" />
            <span>Free Tools</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Free ISP &amp; Network Engineering Utilities
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Run live diagnostics, inspect public routing, size upstream capacity, calculate IPv4 subnets, or explore the pre-populated QC NetCore operator workspace.
          </p>
        </div>

        {/* 5 Free Tool Selector Cards */}
        <div
          role="tablist"
          aria-label="Free ISP Network Tools"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {interactiveTools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                role="tab"
                id={`tab-${tool.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${tool.id}`}
                onClick={() => handleSelectTool(tool.id)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? "bg-surface border-primary ring-1 ring-primary/30 shadow-xs"
                    : "bg-surface hover:bg-surface-subtle border-border hover:border-primary/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isSelected
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-surface-subtle text-muted-foreground border-border"
                      }`}
                    >
                      {isSelected ? "Active Tool" : "Open Tool"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-primary">
                  <span>{isSelected ? "Using below" : "Launch utility"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}

          {/* 5th Card: Live Demo */}
          <Link
            href="/dashboard?demo=true"
            onClick={onEnterDemo}
            className="text-left p-5 rounded-2xl bg-surface hover:bg-surface-subtle border border-amber-500/30 hover:border-amber-500/60 transition-all duration-200 flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Interactive App
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground group-hover:text-amber-500 transition-colors">
                  Live Demo
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  The operator app, already filled with data
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
              <span>Open operator demo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        {/* Interactive Active Tool Workspace */}
        <div
          id={`panel-${activeTool}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTool}`}
          className="p-5 sm:p-7 rounded-3xl bg-surface border border-border shadow-xs"
        >
          {activeTool === "speed-test" && <SpeedTestTool />}
          {activeTool === "what-is-my-ip" && <WhatIsMyIpTool />}
          {activeTool === "bandwidth-calculator" && <BandwidthCalculatorTool />}
          {activeTool === "subnet-calculator" && <SubnetCalculatorTool />}
        </div>
      </div>
    </section>
  );
}
