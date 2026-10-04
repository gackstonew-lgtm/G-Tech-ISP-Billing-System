// ============================================================================
// QC NETCORE — GROUNDED AI ISP OPERATIONS COPILOT ENGINE
// Answers natural-language operational questions strictly grounded in live
// subscriber, financial ledger, OLT/ONT optical, and NOC topology state.
// Never fabricates metrics; proposes role-gated actions requiring confirmation.
// ============================================================================

export interface CopilotContextSnapshot {
  organizationName: string;
  subscribers: Array<{
    id: string;
    accountNumber: string;
    fullName: string;
    status: string;
    balanceDue: number;
    planName: string;
    siteName: string;
    isOnline: boolean;
    rxPowerDbm: number;
    qualityScore: number;
    churnRiskScore: number;
    churnRiskTier: string;
  }>;
  financials: {
    mrr: number;
    arr: number;
    arpu: number;
    collectedThisPeriod: number;
    collectionRatePercent: number;
    totalArOutstanding: number;
    trialBalanceBalanced: boolean;
    pendingApprovalsCount: number;
    unmatchedPaymentsCount: number;
  };
  network: {
    totalRouters: number;
    onlineRouters: number;
    totalOlts: number;
    losOntCount: number;
    openAlertsCount: number;
  };
}

export interface CopilotProposedAction {
  actionId: string;
  label: string;
  targetAccount?: string;
  permissionRequired: string;
  requiresConfirmation: true;
  commandPreview: string;
}

export interface CopilotResponse {
  intent:
    | "SUBSCRIBER_DIAGNOSTIC"
    | "CHURN_AND_OPTICAL_AUDIT"
    | "REVENUE_AND_LEDGER_SUMMARY"
    | "NETWORK_AND_OUTAGE_STATUS"
    | "GENERAL_OPERATIONS_BRIEF";
  headline: string;
  answerMarkdown: string;
  metricsCited: Array<{ label: string; value: string }>;
  proposedActions: CopilotProposedAction[];
}

/**
 * Evaluates a natural-language operator prompt against the grounded operational snapshot.
 */
export function runCopilotQuery(
  prompt: string,
  ctx: CopilotContextSnapshot
): CopilotResponse {
  const q = prompt.trim().toLowerCase();

  // 1. Check if prompt asks about a specific subscriber by name or account number
  const matchedSub = ctx.subscribers.find(
    (s) =>
      q.includes(s.accountNumber.toLowerCase()) ||
      s.fullName
        .toLowerCase()
        .split(/\s+/)
        .some((token) => token.length >= 4 && q.includes(token))
  );

  if (matchedSub) {
    const actions: CopilotProposedAction[] = [];
    if (!matchedSub.isOnline || matchedSub.status === "SUSPENDED") {
      actions.push({
        actionId: `act-coa-${matchedSub.accountNumber}`,
        label:
          matchedSub.balanceDue > 0
            ? `Send M-Pesa STK Renewal Prompt (KES ${matchedSub.balanceDue.toLocaleString()})`
            : `Reset PPPoE Session & Reboot ONT (${matchedSub.accountNumber})`,
        targetAccount: matchedSub.accountNumber,
        permissionRequired:
          matchedSub.balanceDue > 0 ? "billing.reconcile" : "routers.manage",
        requiresConfirmation: true,
        commandPreview:
          matchedSub.balanceDue > 0
            ? `POST /api/v1/mpesa-stk-push { accountReference: "${matchedSub.accountNumber}", amount: ${matchedSub.balanceDue} }`
            : `radclient -x NAS:3799 disconnect User-Name='${matchedSub.accountNumber}'`,
      });
    }
    if (matchedSub.rxPowerDbm < -25.0) {
      actions.push({
        actionId: `act-dispatch-${matchedSub.accountNumber}`,
        label: `Dispatch Fiber Splice Repair Ticket (${matchedSub.rxPowerDbm.toFixed(1)} dBm)`,
        targetAccount: matchedSub.accountNumber,
        permissionRequired: "work_orders.update",
        requiresConfirmation: true,
        commandPreview: `CREATE WorkOrder { type: "REPAIR", customer: "${matchedSub.fullName}", rxDbm: ${matchedSub.rxPowerDbm} }`,
      });
    }

    return {
      intent: "SUBSCRIBER_DIAGNOSTIC",
      headline: `Subscriber 360 Diagnostic — ${matchedSub.fullName} (${matchedSub.accountNumber})`,
      answerMarkdown: `**${matchedSub.fullName}** (\`${matchedSub.accountNumber}\`) at **${
        matchedSub.siteName
      }** is currently **${matchedSub.status}** (${
        matchedSub.isOnline ? "PPPoE Online" : "Session Offline"
      }) on **${matchedSub.planName}**.
- **Financial Balance**: KES ${matchedSub.balanceDue.toLocaleString()}
- **ONT Optical Signal**: \`${matchedSub.rxPowerDbm.toFixed(1)} dBm\`
- **Connection Quality Score**: **${matchedSub.qualityScore}/100**
- **Churn Risk**: **${matchedSub.churnRiskTier}** (${matchedSub.churnRiskScore}/100)`,
      metricsCited: [
        { label: "Status", value: matchedSub.status },
        { label: "Balance Due", value: `KES ${matchedSub.balanceDue.toLocaleString()}` },
        { label: "Optical RX", value: `${matchedSub.rxPowerDbm.toFixed(1)} dBm` },
        { label: "QoE Score", value: `${matchedSub.qualityScore}/100` },
      ],
      proposedActions: actions,
    };
  }

  // 2. Churn risk / optical attenuation / degraded subscribers query
  if (
    q.includes("churn") ||
    q.includes("attenuation") ||
    q.includes("optical") ||
    q.includes("degraded") ||
    q.includes("risk")
  ) {
    const atRisk = ctx.subscribers.filter(
      (s) => s.churnRiskScore >= 50 || s.rxPowerDbm < -25.0 || s.qualityScore < 75
    );
    const listText =
      atRisk.length === 0
        ? "All active subscribers currently have healthy optical power (-15 to -24.5 dBm) and low churn risk."
        : atRisk
            .map(
              (s) =>
                `- **${s.fullName}** (\`${s.accountNumber}\`): Churn Risk **${
                  s.churnRiskTier
                } (${s.churnRiskScore}/100)** · QoE **${
                  s.qualityScore
                }/100** · Optical \`${s.rxPowerDbm.toFixed(1)} dBm\` · Balance **KES ${s.balanceDue.toLocaleString()}**`
            )
            .join("\n");

    return {
      intent: "CHURN_AND_OPTICAL_AUDIT",
      headline: `Proactive Retention & Optical Health Audit (${atRisk.length} Flagged)`,
      answerMarkdown: `Identified **${atRisk.length}** subscriber(s) requiring retention or fiber link intervention:\n${listText}`,
      metricsCited: [
        { label: "At-Risk Subscribers", value: String(atRisk.length) },
        { label: "LOS / Degraded ONTs", value: String(ctx.network.losOntCount) },
        { label: "Total Subscribers", value: String(ctx.subscribers.length) },
      ],
      proposedActions:
        atRisk.length > 0
          ? [
              {
                actionId: "act-retention-campaign",
                label: `Send WhatsApp Renewal & Link Check Notice to ${atRisk.length} Subscriber(s)`,
                permissionRequired: "customers.update",
                requiresConfirmation: true,
                commandPreview: `DISPATCH WhatsApp Template EXPIRY_REMINDER_48H to ${atRisk.length} recipients`,
              },
            ]
          : [],
    };
  }

  // 3. Financial ledger, revenue, MRR, AR aging, reconciliation query
  if (
    q.includes("revenue") ||
    q.includes("ledger") ||
    q.includes("mrr") ||
    q.includes("arpu") ||
    q.includes("balance") ||
    q.includes("payment") ||
    q.includes("reconcil")
  ) {
    const f = ctx.financials;
    return {
      intent: "REVENUE_AND_LEDGER_SUMMARY",
      headline: "Double-Entry Financial Ledger & Revenue Intelligence Summary",
      answerMarkdown: `- **Monthly Recurring Revenue (MRR)**: **KES ${f.mrr.toLocaleString()}** (ARR: **KES ${f.arr.toLocaleString()}**, ARPU: **KES ${f.arpu.toLocaleString()}**)
- **Collections & Efficiency**: **KES ${f.collectedThisPeriod.toLocaleString()}** collected (${f.collectionRatePercent}% collection rate)
- **Accounts Receivable Outstanding**: **KES ${f.totalArOutstanding.toLocaleString()}**
- **Double-Entry Trial Balance**: **${
        f.trialBalanceBalanced ? "BALANCED (0.00 discrepancy)" : "DISCREPANCY DETECTED"
      }**
- **Governance Queue**: **${f.unmatchedPaymentsCount}** unmatched payment(s) · **${
        f.pendingApprovalsCount
      }** Maker-Checker approval request(s)`,
      metricsCited: [
        { label: "MRR", value: `KES ${f.mrr.toLocaleString()}` },
        { label: "ARPU", value: `KES ${f.arpu.toLocaleString()}` },
        { label: "Collection Rate", value: `${f.collectionRatePercent}%` },
        { label: "AR Outstanding", value: `KES ${f.totalArOutstanding.toLocaleString()}` },
      ],
      proposedActions:
        f.unmatchedPaymentsCount > 0
          ? [
              {
                actionId: "act-open-recon",
                label: `Review ${f.unmatchedPaymentsCount} Unmatched Payment(s) in Reconciliation Queue`,
                permissionRequired: "billing.reconcile",
                requiresConfirmation: true,
                commandPreview: `NAVIGATE /billing?tab=reconciliation`,
              },
            ]
          : [],
    };
  }

  // 4. Network, OLT, router, outage blast radius query
  if (
    q.includes("router") ||
    q.includes("olt") ||
    q.includes("outage") ||
    q.includes("network") ||
    q.includes("blast") ||
    q.includes("noc")
  ) {
    return {
      intent: "NETWORK_AND_OUTAGE_STATUS",
      headline: "NOC Control Plane, MikroTik Fleet & GPON OLT Telemetry",
      answerMarkdown: `- **MikroTik BNG Fleet**: **${ctx.network.onlineRouters}/${ctx.network.totalRouters}** routers online via WireGuard tunnel
- **GPON/XGS-PON OLTs**: **${ctx.network.totalOlts}** chassis active · **${ctx.network.losOntCount}** ONT(s) with optical alarm
- **Active NOC Alerts**: **${ctx.network.openAlertsCount}** open alert(s) correlated across topology tree`,
      metricsCited: [
        {
          label: "Routers Online",
          value: `${ctx.network.onlineRouters}/${ctx.network.totalRouters}`,
        },
        { label: "Active OLTs", value: String(ctx.network.totalOlts) },
        { label: "ONT Alarms", value: String(ctx.network.losOntCount) },
        { label: "Open Alerts", value: String(ctx.network.openAlertsCount) },
      ],
      proposedActions: [],
    };
  }

  // 5. General executive brief
  return {
    intent: "GENERAL_OPERATIONS_BRIEF",
    headline: `${ctx.organizationName} — Live ISP Operating System Brief`,
    answerMarkdown: `- **Subscribers**: **${ctx.subscribers.length}** total (**${
      ctx.subscribers.filter((s) => s.status === "ACTIVE").length
    }** active, **${ctx.subscribers.filter((s) => s.isOnline).length}** online sessions)
- **Financials**: **KES ${ctx.financials.mrr.toLocaleString()}** MRR · **${
      ctx.financials.collectionRatePercent
    }%** collection rate · Trial Balance **${
      ctx.financials.trialBalanceBalanced ? "Verified" : "Check Needed"
    }**
- **Network & Fiber**: **${ctx.network.onlineRouters}/${
      ctx.network.totalRouters
    }** MikroTik routers online · **${ctx.network.totalOlts}** OLT(s) monitored`,
    metricsCited: [
      { label: "MRR", value: `KES ${ctx.financials.mrr.toLocaleString()}` },
      {
        label: "Online Sessions",
        value: `${ctx.subscribers.filter((s) => s.isOnline).length}/${ctx.subscribers.length}`,
      },
      {
        label: "Routers Online",
        value: `${ctx.network.onlineRouters}/${ctx.network.totalRouters}`,
      },
      { label: "Open Alerts", value: String(ctx.network.openAlertsCount) },
    ],
    proposedActions: [],
  };
}
