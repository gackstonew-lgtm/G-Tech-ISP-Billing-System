"use client";

import React, { useState } from "react";
import {
  Network,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn, formatShortDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  SEED_TOPOLOGY_NODES,
  SEED_AUTOMATION_RULES,
} from "@/lib/db/os-2027-seed";
import {
  correlateOutageBlastRadius,
  AutomationRule,
} from "@/lib/network/topology-gis-automation";

export function TopologyAndAutomationPanels() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-rtr-01");
  const [rules, setRules] = useState<AutomationRule[]>(
    () => SEED_AUTOMATION_RULES
  );

  const blastRadius = correlateOutageBlastRadius(
    SEED_TOPOLOGY_NODES,
    selectedNodeId
  );

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Interactive Topology & Outage Blast-Radius Correlator */}
      <section className="rounded-lg border border-border bg-surface shadow-xs">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">
                Network Topology &amp; Outage Blast-Radius Correlation
              </h3>
              <p className="text-xs text-muted-foreground">
                Select any node to simulate root-cause failure impact and child
                alarm suppression.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-3 p-4">
          <div className="space-y-1.5">
            {SEED_TOPOLOGY_NODES.map((node) => {
              const selected = node.id === selectedNodeId;
              const indent =
                node.nodeType === "UPSTREAM_TRANSIT"
                  ? "ml-0"
                  : node.nodeType === "CORE_ROUTER"
                  ? "ml-4"
                  : node.nodeType === "OLT"
                  ? "ml-8"
                  : "ml-12";
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors",
                    indent,
                    selected
                      ? "border-primary bg-primary-soft font-medium text-primary"
                      : "border-border bg-surface hover:bg-surface-subtle"
                  )}
                  style={{
                    width:
                      node.nodeType === "UPSTREAM_TRANSIT"
                        ? "100%"
                        : node.nodeType === "CORE_ROUTER"
                        ? "calc(100% - 1rem)"
                        : node.nodeType === "OLT"
                        ? "calc(100% - 2rem)"
                        : "calc(100% - 3rem)",
                  }}
                >
                  <div>
                    <span className="font-mono text-[11px] opacity-75">
                      [{node.nodeType}]
                    </span>{" "}
                    <span>{node.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {node.subscriberCount} subs · {node.latencyMs}ms
                    </span>
                    <StatusBadge status={node.status} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Blast Radius Analysis: {blastRadius.rootNodeName}
              </span>
            </div>
            <p className="mt-1 text-foreground">
              <strong>Impact:</strong> {blastRadius.estimatedAffectedSubscribers}{" "}
              subscriber(s) across{" "}
              {blastRadius.affectedDownstreamNodes.length} downstream node(s) ·{" "}
              <strong>{blastRadius.suppressedChildAlertCount}</strong> child
              alarms auto-suppressed.
            </p>
            <p className="mt-1 text-muted-foreground">
              <strong>Root Cause Hypothesis:</strong>{" "}
              {blastRadius.probableRootCause}
            </p>
          </div>
        </div>
      </section>

      {/* IF-THIS-THEN-THAT Event-Driven Automation Rules */}
      <section className="rounded-lg border border-border bg-surface shadow-xs">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">
                Autonomous IF-THIS-THEN-THAT Operations Engine
              </h3>
              <p className="text-xs text-muted-foreground">
                Closed-loop automation rules triggered by real-time billing and
                NOC telemetry events.
              </p>
            </div>
          </div>
        </header>

        <div className="divide-y divide-border-subtle">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start justify-between gap-3 p-4 text-xs"
            >
              <div className="space-y-1">
                <div className="font-semibold text-foreground">{rule.name}</div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  IF <span className="text-primary">{rule.triggerEvent}</span>{" "}
                  ({rule.conditionSummary}) &rarr;{" "}
                  <span className="font-semibold text-foreground">
                    {rule.actionType}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Executed {rule.executionCount} times
                  {rule.lastTriggeredAt &&
                    ` · Last: ${formatShortDate(rule.lastTriggeredAt)}`}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={rule.isEnabled}
                onClick={() => toggleRule(rule.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  rule.isEnabled
                    ? "border-success/30 bg-success-soft text-success"
                    : "border-border bg-surface-subtle text-muted-foreground"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {rule.isEnabled ? "Active" : "Paused"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
