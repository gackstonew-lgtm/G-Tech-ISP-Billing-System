"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  X,
  CheckCircle2,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { btnClass } from "@/components/ui/PageHeader";
import { runCopilotQuery, CopilotResponse } from "@/lib/ai/copilot";
import { buildSeedCopilotSnapshot } from "@/lib/db/os-2027-seed";

const QUICK_PROMPTS = [
  "Why is David Koech (GT-8923) offline?",
  "Which subscribers have high churn risk or optical attenuation?",
  "Summarize today's MRR, ARPU, and Trial Balance",
  "Check NOC router and GPON OLT status",
];

export function AiOperationsCopilotDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<
    Array<{ query: string; response: CopilotResponse }>
  >(() => {
    const snap = buildSeedCopilotSnapshot();
    return [
      {
        query: "Operational system status brief",
        response: runCopilotQuery("General operations brief", snap),
      },
    ];
  });
  const [confirmedActions, setConfirmedActions] = useState<Record<string, boolean>>(
    {}
  );

  if (!open) return null;

  const handleAsk = (qText: string) => {
    const trimmed = qText.trim();
    if (!trimmed) return;
    const snap = buildSeedCopilotSnapshot();
    const res = runCopilotQuery(trimmed, snap);
    setHistory((prev) => [{ query: trimmed, response: res }, ...prev]);
    setPrompt("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="QC NetCore AI ISP Operations Copilot"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-lg flex-col border-l border-border bg-surface text-foreground shadow-[var(--shadow-pop)]">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">
                AI ISP Operations Copilot
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Grounded in live Ledger, MikroTik/RADIUS, and GPON OLT telemetry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI Copilot"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-elevated"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Quick Prompts */}
        <div className="border-b border-border bg-surface-subtle p-3">
          <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">
            Suggested diagnostics:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => handleAsk(qp)}
                className="rounded-md border border-border bg-surface px-2.5 py-1 text-left text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Responses */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
          {history.map((item, idx) => (
            <div
              key={`${item.query}-${idx}`}
              className="rounded-lg border border-border bg-surface-subtle p-3.5 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-semibold text-primary">
                  Q: {item.query}
                </span>
                <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {item.response.intent}
                </span>
              </div>

              <div>
                <div className="font-semibold text-foreground">
                  {item.response.headline}
                </div>
                <div className="mt-1.5 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {item.response.answerMarkdown}
                </div>
              </div>

              {/* Cited Authoritative Metrics */}
              {item.response.metricsCited.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {item.response.metricsCited.map((m) => (
                    <div
                      key={m.label}
                      className="rounded border border-border bg-surface p-2"
                    >
                      <div className="text-[10px] text-muted-foreground">
                        {m.label}
                      </div>
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirmation-Gated Actions */}
              {item.response.proposedActions.map((act) => {
                const confirmed = Boolean(confirmedActions[act.actionId]);
                return (
                  <div
                    key={act.actionId}
                    className="rounded-md border border-primary/25 bg-surface p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        Proposed Action (Requires Operator Confirmation)
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        RBAC: {act.permissionRequired}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      <Terminal className="mr-1 inline h-3 w-3" />
                      {act.commandPreview}
                    </div>
                    {confirmed ? (
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmed &amp; Dispatched to Control Plane
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmedActions((prev) => ({
                            ...prev,
                            [act.actionId]: true,
                          }))
                        }
                        className={btnClass("primary", "h-7 px-2.5 text-xs")}
                      >
                        Confirm: {act.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Prompt Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(prompt);
          }}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <input
            type="text"
            aria-label="Ask AI ISP Operations Copilot"
            placeholder="Ask about subscribers, optical dBm, MRR, or outages…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className={cn(btnClass("primary", "h-9 px-3 text-xs"))}
          >
            <Send className="h-3.5 w-3.5" />
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
