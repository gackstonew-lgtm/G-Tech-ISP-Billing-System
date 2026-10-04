// ============================================================================
// QC NETCORE — GROUNDED AI ISP OPERATIONS COPILOT ENGINE
// ============================================================================
// Architecture:
//   Question -> Intent & Pronoun Resolution -> Authorized Copilot Toolkit ->
//   Live Tenant Data (or Isolated Demo Data) -> Cross-Module Correlation ->
//   Validation & Calculation Explanation -> Grounded Answer + Audit Trail
// ============================================================================

import {
  CopilotToolkit,
  buildDemoCopilotEnvironment,
  recordCopilotAudit,
  type CopilotDataset,
  type CopilotEnvironmentMode,
  type CopilotExecutionContext,
  type EnrichedSubscriberRecord,
} from "./copilot-tools.ts";
import type { UserRole } from "../../types/index.ts";

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

export interface CopilotConversationMemory {
  lastSubscriberId?: string;
  lastSubscriberName?: string;
  lastAccountNumber?: string;
  lastPackageId?: string;
  lastPackageName?: string;
  lastRouterId?: string;
  lastRouterName?: string;
}

export type CopilotIntent =
  | "SUBSCRIBER_DIAGNOSTIC"
  | "NEWEST_SUBSCRIBER_LOOKUP"
  | "SUBSCRIBER_LIST_FILTER"
  | "CUSTOMER_360_DOSSIER"
  | "CONTEXTUAL_FOLLOW_UP"
  | "CHURN_AND_OPTICAL_AUDIT"
  | "REVENUE_AND_LEDGER_SUMMARY"
  | "TODAYS_COLLECTIONS_SUMMARY"
  | "OVERDUE_ACCOUNTS_RANKING"
  | "PACKAGE_ANALYTICS"
  | "NETWORK_AND_OUTAGE_STATUS"
  | "ROUTER_SESSIONS_AND_HEALTH"
  | "BUSINESS_PERFORMANCE_SUMMARY"
  | "SMS_COMMUNICATIONS_QUERY"
  | "SMS_CAMPAIGN_PROPOSAL"
  | "FEATURE_AND_NAVIGATION_GUIDE"
  | "AMBIGUOUS_QUERY_CLARIFICATION"
  | "SECURITY_POLICY_REFUSAL"
  | "PERMISSION_DENIED"
  | "GENERAL_OPERATIONS_BRIEF";

export interface CopilotResponse {
  intent: CopilotIntent;
  headline: string;
  answerMarkdown: string;
  metricsCited: Array<{ label: string; value: string }>;
  proposedActions: CopilotProposedAction[];
  toolsInvoked?: string[];
  sourcesCited?: string[];
  environmentMode?: CopilotEnvironmentMode;
  dataCheckedAt?: string;
  confidenceLevel?: "CONFIRMED" | "LIKELY" | "POSSIBLE";
  conversationContext?: CopilotConversationMemory;
}

function formatDateTimeEAT(iso?: string | null, timezone = "Africa/Nairobi"): string {
  if (!iso) return "Not recorded";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

function formatDateOnly(iso?: string | null, timezone = "Africa/Nairobi"): string {
  if (!iso) return "Not set";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: timezone,
    }).format(d);
  } catch {
    return d.toISOString().split("T")[0];
  }
}

/**
 * Converts a legacy CopilotContextSnapshot into a CopilotDataset if a test caller
 * passes a custom snapshot directly to `runCopilotQuery(prompt, snapshot)`.
 */
function adaptSnapshotToEnvironment(snapshot: CopilotContextSnapshot): {
  ctx: CopilotExecutionContext;
  dataset: CopilotDataset;
} {
  const base = buildDemoCopilotEnvironment();
  const orgId = base.ctx.organizationId;

  // Merge custom subscribers from snapshot if provided
  if (snapshot.subscribers && snapshot.subscribers.length > 0) {
    base.dataset.customers = snapshot.subscribers.map((s, idx) => {
      const existing = base.dataset.customers.find(
        (c) => c.id === s.id || c.accountNumber === s.accountNumber
      );
      return {
        id: s.id || existing?.id || `cust-snap-${idx}`,
        organizationId: orgId,
        accountNumber: s.accountNumber,
        fullName: s.fullName,
        phoneNumber: existing?.phoneNumber || "0700000000",
        email: existing?.email,
        physicalAddress: existing?.physicalAddress || s.siteName,
        siteName: s.siteName,
        status: (s.status as "ACTIVE" | "SUSPENDED") || "ACTIVE",
        balanceDue: s.balanceDue,
        createdAt:
          existing?.createdAt ||
          new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
      };
    });

    base.dataset.pppoeAccounts = snapshot.subscribers.map((s) => {
      const existing = base.dataset.pppoeAccounts.find(
        (p) => p.customerId === s.id
      );
      return {
        id: existing?.id || `pppoe-${s.id}`,
        organizationId: orgId,
        customerId: s.id,
        routerId: existing?.routerId || "rtr-01",
        username: existing?.username || `user_${s.accountNumber.toLowerCase()}`,
        passwordPlain: "[REDACTED]",
        servicePlanId: existing?.servicePlanId || "plan-pppoe-10m",
        ipAssignmentType: existing?.ipAssignmentType || "POOL",
        currentIp: existing?.currentIp || (s.isOnline ? "10.10.12.45" : undefined),
        macAddress: existing?.macAddress,
        isActive: s.status === "ACTIVE",
        isOnline: s.isOnline,
        uptime: existing?.uptime || (s.isOnline ? "2d 04h" : "0s"),
        bytesIn: existing?.bytesIn || 0,
        bytesOut: existing?.bytesOut || 0,
      };
    });

    base.dataset.onts = snapshot.subscribers.map((s) => {
      const existing = base.dataset.onts.find((o) => o.customerId === s.id);
      return {
        id: existing?.id || `ont-${s.id}`,
        organizationId: orgId,
        oltId: existing?.oltId || "olt-01",
        oltName: existing?.oltName || "Huawei-MA5800-X7-CBD",
        customerId: s.id,
        customerName: s.fullName,
        accountNumber: s.accountNumber,
        serialNumber: existing?.serialNumber || `HWTC-${s.accountNumber}`,
        vendorModel: existing?.vendorModel || "Huawei EchoLife HG8546M",
        ponPortLabel: existing?.ponPortLabel || "GPON 0/1/0:1",
        rxPowerDbm: s.rxPowerDbm,
        txPowerDbm: 2.2,
        oltRxPowerDbm: s.rxPowerDbm - 1.4,
        temperatureC: 42,
        voltageV: 3.3,
        distanceMeters: 1200,
        serviceVlan: 210,
        status: s.rxPowerDbm < -27.0 ? "LOS" : s.isOnline ? "ONLINE" : "OFFLINE",
        firmwareVersion: "V5R019",
        connectedClients: s.isOnline ? 4 : 0,
        lastSeenAt: new Date().toISOString(),
      };
    });
  }

  base.ctx.organizationName = snapshot.organizationName || base.ctx.organizationName;
  base.dataset.organization.name = base.ctx.organizationName;
  return base;
}

/**
 * Formats a comprehensive enriched subscriber card in Markdown using only real fields.
 */
function formatEnrichedSubscriberMarkdown(
  sub: EnrichedSubscriberRecord,
  ctx: CopilotExecutionContext,
  headingLabel?: string
): string {
  const lines: string[] = [];
  if (headingLabel) {
    lines.push(`### ${headingLabel}`);
  }
  lines.push(`**${sub.fullName}** (\`${sub.accountNumber}\`)`);
  lines.push(`- **Account Number:** \`${sub.accountNumber}\``);
  lines.push(`- **Service:** ${sub.serviceType}`);
  lines.push(`- **Package:** ${sub.packageName} (${sub.speedMbpsLabel})`);
  lines.push(`- **IP Address:** ${sub.ipAddress ? `\`${sub.ipAddress}\`` : "No active IP assigned"}`);
  if (sub.macAddress) {
    lines.push(`- **MAC / CPE Serial:** \`${sub.macAddress}\``);
  }
  lines.push(`- **Status:** ${sub.status}`);
  lines.push(
    `- **Current Session:** ${sub.sessionStatus}${
      sub.isOnline && sub.uptime ? ` (Uptime: ${sub.uptime})` : ""
    }`
  );
  lines.push(`- **POP / Site:** ${sub.popSiteName}`);
  if (sub.routerName) {
    lines.push(`- **Router:** ${sub.routerName}`);
  }
  lines.push(`- **Registered:** ${formatDateTimeEAT(sub.registeredAt, ctx.timezone)}`);
  if (sub.lastPaymentAmount !== null) {
    lines.push(
      `- **Last Payment:** ${ctx.currency} ${sub.lastPaymentAmount.toLocaleString()}${
        sub.lastPaymentReference ? ` (\`${sub.lastPaymentReference}\`)` : ""
      }${
        sub.lastPaymentDate
          ? ` on ${formatDateOnly(sub.lastPaymentDate, ctx.timezone)}`
          : ""
      }`
    );
  } else {
    lines.push(`- **Last Payment:** No confirmed payment record found`);
  }
  lines.push(`- **Payment Status:** ${sub.paymentStatus}`);
  lines.push(`- **Balance Due:** ${ctx.currency} ${sub.balanceDue.toLocaleString()}`);
  lines.push(
    `- **Expiry:** ${
      sub.expiresAt ? formatDateOnly(sub.expiresAt, ctx.timezone) : "Not scheduled"
    }`
  );
  if (sub.rxPowerDbm !== null) {
    lines.push(
      `- **ONT Optical Signal:** \`${sub.rxPowerDbm.toFixed(1)} dBm\` (QoE Score: **${sub.qualityScore}/100**)`
    );
  }
  return lines.join("\n");
}

function buildProposedActionsForSubscriber(
  sub: EnrichedSubscriberRecord,
  currency: string
): CopilotProposedAction[] {
  const actions: CopilotProposedAction[] = [];
  if (!sub.isOnline || sub.status === "SUSPENDED") {
    actions.push({
      actionId: `act-coa-${sub.accountNumber}`,
      label:
        sub.balanceDue > 0
          ? `Send M-Pesa STK Renewal Prompt (${currency} ${sub.balanceDue.toLocaleString()})`
          : `Reset PPPoE Session & Reboot ONT (${sub.accountNumber})`,
      targetAccount: sub.accountNumber,
      permissionRequired:
        sub.balanceDue > 0 ? "billing.reconcile" : "routers.manage",
      requiresConfirmation: true,
      commandPreview:
        sub.balanceDue > 0
          ? `POST /api/v1/mpesa-stk-push { accountReference: "${sub.accountNumber}", amount: ${sub.balanceDue} }`
          : `radclient -x NAS:3799 disconnect User-Name='${sub.pppoeUsername || sub.accountNumber}'`,
    });
  }
  if (sub.rxPowerDbm !== null && sub.rxPowerDbm < -25.0) {
    actions.push({
      actionId: `act-dispatch-${sub.accountNumber}`,
      label: `Dispatch Fiber Splice Repair Ticket (${sub.rxPowerDbm.toFixed(1)} dBm)`,
      targetAccount: sub.accountNumber,
      permissionRequired: "work_orders.update",
      requiresConfirmation: true,
      commandPreview: `CREATE WorkOrder { type: "REPAIR", customer: "${sub.fullName}", rxDbm: ${sub.rxPowerDbm} }`,
    });
  }
  return actions;
}

/**
 * Primary Operational Intelligence Execution Engine.
 */
export function executeCopilotIntelligence(params: {
  prompt: string;
  ctx: CopilotExecutionContext;
  dataset: CopilotDataset;
  memory?: CopilotConversationMemory;
}): CopilotResponse {
  const { prompt, ctx, dataset } = params;
  const memory: CopilotConversationMemory = { ...(params.memory || {}) };
  const toolkit = new CopilotToolkit(ctx, dataset);
  const q = prompt.trim().toLowerCase();
  const checkedLabel = formatDateTimeEAT(ctx.checkedAtIso, ctx.timezone);
  const modeLabel =
    ctx.environmentMode === "LIVE_TENANT_DATA" ? "Live Tenant Data" : "Demo Data";

  const finalize = (
    res: Omit<
      CopilotResponse,
      "toolsInvoked" | "sourcesCited" | "environmentMode" | "dataCheckedAt" | "conversationContext"
    >
  ): CopilotResponse => {
    const sources = Array.from(toolkit.sourcesConsulted);
    recordCopilotAudit({
      timestamp: ctx.checkedAtIso,
      userId: ctx.userId || "operator",
      userRole: ctx.userRole,
      organizationId: ctx.organizationId,
      environmentMode: ctx.environmentMode,
      question: prompt,
      toolsInvoked: [...toolkit.toolsInvoked],
      sourcesConsulted: sources,
      permissionDenials: [...toolkit.permissionDenials],
    });

    const footerNote = `\n\n*Data checked: ${checkedLabel} (${ctx.timezone}) · Environment: ${modeLabel}${
      sources.length > 0 ? ` · Sources: ${sources.join(", ")}` : ""
    }*`;

    return {
      ...res,
      answerMarkdown: res.answerMarkdown.includes("Data checked:")
        ? res.answerMarkdown
        : `${res.answerMarkdown}${footerNote}`,
      toolsInvoked: [...toolkit.toolsInvoked],
      sourcesCited: sources,
      environmentMode: ctx.environmentMode,
      dataCheckedAt: ctx.checkedAtIso,
      conversationContext: memory,
    };
  };

  // ==========================================================================
  // 0. SECURITY & SECRET PROTECTION RULE (Rule 30)
  // ==========================================================================
  if (
    /\b(password|passwords|service_role|service key|api key|secret key|radius secret|webhook secret|private key|session token)\b/i.test(
      q
    ) &&
    !/\b(how does|reset password|forgot password|where do i)\b/i.test(q)
  ) {
    return finalize({
      intent: "SECURITY_POLICY_REFUSAL",
      headline: "Security Policy — Credentials & Secret Protection",
      answerMarkdown:
        "For security and compliance reasons, QC NetCore AI Copilot **never exposes passwords, API keys, Supabase service keys, MikroTik RouterOS credentials, FreeRADIUS shared secrets, payment webhook secrets, or private keys**.\n\nAuthorized administrators can rotate credentials directly in `/settings` or `/routers`.",
      metricsCited: [
        { label: "Policy", value: "Zero Secret Exposure" },
        { label: "Environment", value: modeLabel },
      ],
      proposedActions: [],
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 1. NEWEST / OLDEST / TOP-N NEWEST SUBSCRIBERS (Rules 6, 8, 16, 21, 41)
  // ==========================================================================
  if (
    /\b(newest|most recent|joined most recently|latest subscriber|latest customer|newest customer|newest subscriber|newest subscribers|newest customers)\b/i.test(
      q
    )
  ) {
    const countMatch = q.match(/\b(\d+)\s+(?:newest|most recent|latest)\b/) ||
      q.match(/\b(?:newest|latest)\s+(\d+)\b/);
    const limit = countMatch ? Math.min(50, Math.max(1, Number(countMatch[1]))) : 1;

    const toolRes = toolkit.getNewestSubscriber(limit);
    if (!toolRes.ok) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown: toolRes.message || "You don't have permission to view subscriber records.",
        metricsCited: [],
        proposedActions: [],
      });
    }

    const list = toolRes.data ?? [];
    if (list.length === 0) {
      return finalize({
        intent: "NEWEST_SUBSCRIBER_LOOKUP",
        headline: "No Subscriber Records Found",
        answerMarkdown:
          "I couldn't find any subscriber records in the current QC NetCore tenant database.",
        metricsCited: [{ label: "Subscribers Found", value: "0" }],
        proposedActions: [],
      });
    }

    const newest = list[0];
    memory.lastSubscriberId = newest.id;
    memory.lastSubscriberName = newest.fullName;
    memory.lastAccountNumber = newest.accountNumber;
    memory.lastPackageId = newest.packageId;
    memory.lastPackageName = newest.packageName;
    memory.lastRouterId = newest.routerId || undefined;
    memory.lastRouterName = newest.routerName || undefined;

    if (limit === 1 && !/\b(subscribers|customers)\b/.test(q.replace(/newest subscriber$/, ""))) {
      return finalize({
        intent: "NEWEST_SUBSCRIBER_LOOKUP",
        headline: `Newest Subscriber — ${newest.fullName} (${newest.accountNumber})`,
        answerMarkdown: formatEnrichedSubscriberMarkdown(
          newest,
          ctx,
          "Newest Subscriber"
        ),
        metricsCited: [
          { label: "Subscriber", value: newest.fullName },
          { label: "Account", value: newest.accountNumber },
          { label: "Package", value: newest.packageName },
          { label: "Status", value: `${newest.status} (${newest.sessionStatus})` },
        ],
        proposedActions: buildProposedActionsForSubscriber(newest, ctx.currency),
        confidenceLevel: "CONFIRMED",
      });
    }

    const rows = list
      .map(
        (s, idx) =>
          `| ${idx + 1} | **${s.fullName}** (\`${s.accountNumber}\`) | ${s.packageName} | ${
            s.ipAddress || "—"
          } | ${s.status} (${s.sessionStatus}) | ${s.popSiteName} | ${formatDateOnly(
            s.registeredAt,
            ctx.timezone
          )} |`
      )
      .join("\n");

    return finalize({
      intent: "NEWEST_SUBSCRIBER_LOOKUP",
      headline: `${list.length} Newest Subscribers (Ordered by Registration Date)`,
      answerMarkdown: `| # | Subscriber | Package | IP | Status | POP / Site | Registered |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}`,
      metricsCited: [
        { label: "Returned", value: String(list.length) },
        { label: "Newest", value: newest.fullName },
        { label: "Latest Account", value: newest.accountNumber },
      ],
      proposedActions: [],
      confidenceLevel: "CONFIRMED",
    });
  }

  if (/\b(oldest subscriber|oldest customer|first subscriber|first customer)\b/i.test(q)) {
    const toolRes = toolkit.getOldestSubscriber(1);
    if (!toolRes.ok) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown: toolRes.message || "You don't have permission to view subscriber records.",
        metricsCited: [],
        proposedActions: [],
      });
    }
    const oldest = toolRes.data?.[0];
    if (!oldest) {
      return finalize({
        intent: "NEWEST_SUBSCRIBER_LOOKUP",
        headline: "No Subscriber Records Found",
        answerMarkdown: "I couldn't find any subscriber records in the current QC NetCore records.",
        metricsCited: [],
        proposedActions: [],
      });
    }
    memory.lastSubscriberId = oldest.id;
    memory.lastSubscriberName = oldest.fullName;
    memory.lastAccountNumber = oldest.accountNumber;

    return finalize({
      intent: "NEWEST_SUBSCRIBER_LOOKUP",
      headline: `Oldest Subscriber — ${oldest.fullName} (${oldest.accountNumber})`,
      answerMarkdown: formatEnrichedSubscriberMarkdown(
        oldest,
        ctx,
        "Oldest Subscriber"
      ),
      metricsCited: [
        { label: "Subscriber", value: oldest.fullName },
        { label: "Account", value: oldest.accountNumber },
        { label: "Registered", value: formatDateOnly(oldest.registeredAt, ctx.timezone) },
      ],
      proposedActions: [],
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 2. AMBIGUOUS "WHICH CUSTOMERS ARE NEW?" CLARIFICATION (Rule 25)
  // ==========================================================================
  if (
    /^\s*(which|who are|show)\s+(the\s+)?(customers|subscribers)\s+(are\s+|that are\s+)?new\??\s*$/i.test(
      q
    )
  ) {
    const growth = toolkit.getCustomerGrowth();
    const newest = toolkit.getNewestSubscriber(1).data?.[0];
    return finalize({
      intent: "AMBIGUOUS_QUERY_CLARIFICATION",
      headline: "Clarification Needed — 'New' Subscribers",
      answerMarkdown: `Do you mean **newly registered subscribers** (by registration date), **newly activated subscriptions**, or **subscribers pending field installation**?\n\nFor immediate reference from current records:\n- **Most Recently Registered Subscriber:** ${
        newest ? `**${newest.fullName}** (\`${newest.accountNumber}\`, registered ${formatDateOnly(newest.registeredAt, ctx.timezone)})` : "None"
      }\n- **Pending Field Installation:** **${growth.data?.pendingInstallations ?? 0}** subscriber(s)\n- **Total Active Subscribers:** **${growth.data?.activeCustomers ?? 0}**`,
      metricsCited: [
        {
          label: "Pending Installation",
          value: String(growth.data?.pendingInstallations ?? 0),
        },
        {
          label: "Most Recent",
          value: newest ? newest.fullName : "—",
        },
      ],
      proposedActions: [],
    });
  }

  // ==========================================================================
  // ==========================================================================
  // 2.5 SMS COMMUNICATIONS INTELLIGENCE & CONFIRMATION-GATED CAMPAIGNS
  // ==========================================================================
  if (
    /\b(sms|payment reminder|payment reminders|valid phone|phone numbers|can receive sms)\b/i.test(
      q
    ) &&
    !/\b(how does|how do i|where do i|where can i|explain|configure)\b/i.test(q)
  ) {
    // A. Confirmation-gated bulk SMS campaign request ("Send a payment reminder to customers with overdue balances")
    if (/\b(send|dispatch|broadcast|notify|trigger)\b/i.test(q)) {
      const recipientMode = /\bsuspended\b/i.test(q)
        ? "SUSPENDED_SUBSCRIBERS"
        : /\bexpiring\b/i.test(q)
        ? "EXPIRING_SUBSCRIBERS"
        : /\bactive\b/i.test(q)
        ? "ACTIVE_SUBSCRIBERS"
        : "OVERDUE_CUSTOMERS";

      const previewRes = toolkit.previewSmsCampaignTool({
        recipientMode,
        category: "TRANSACTIONAL",
      });

      if (!previewRes.ok || !previewRes.data) {
        return finalize({
          intent: "PERMISSION_DENIED",
          headline: "Permission Required for Bulk SMS",
          answerMarkdown:
            previewRes.message ||
            "You do not have permission (`sms.send_bulk`) to prepare or send bulk SMS campaigns.",
          metricsCited: [],
          proposedActions: [],
        });
      }

      const p = previewRes.data;
      const recipientLines = p.samplePreviews
        .map(
          (r) =>
            `- **${r.customerName}** (\`${r.accountNumber}\`) · Phone: \`${r.phone}\` · Package: ${r.packageName}`
        )
        .join("\n");

      return finalize({
        intent: "SMS_CAMPAIGN_PROPOSAL",
        headline: `Confirmation Required — Payment Reminder SMS Campaign (${p.recipientCount} Eligible Recipient(s))`,
        answerMarkdown: `I have prepared a **Payment Reminder SMS Campaign** targeting **${recipientMode}** in **${ctx.organizationName}**. **No SMS messages have been sent yet** — explicit operator confirmation is required before bulk dispatch.\n\n### Campaign Summary\n- **Target Group:** \`${recipientMode}\`\n- **Eligible Recipients:** **${p.recipientCount}** subscriber(s) with verified E.164 phone numbers\n- **Skipped (Invalid/Opt-Out):** **${p.skippedInvalidCount + p.skippedOptOutCount}**\n- **Encoding & Segments:** \`${p.encoding}\` (**${p.estimatedTotalSegments}** total SMS segments)\n- **Gateway Status:** ${p.providerStatusMessage}\n\n### Sample Eligible Recipients\n${recipientLines || "No eligible recipients matched."}\n\n### Sample Personalized Preview\n> ${p.samplePreviews[0]?.resolvedMessage || "No preview available"}`,
        metricsCited: [
          { label: "Eligible Recipients", value: String(p.recipientCount) },
          {
            label: "Excluded",
            value: String(p.skippedInvalidCount + p.skippedOptOutCount),
          },
          { label: "Total Segments", value: String(p.estimatedTotalSegments) },
          { label: "Encoding", value: p.encoding },
        ],
        proposedActions: [
          {
            actionId: "act-confirm-bulk-sms-overdue",
            label: `Confirm & Send Payment Reminder SMS to ${p.recipientCount} Customer(s)`,
            permissionRequired: "sms.send_bulk",
            requiresConfirmation: true,
            commandPreview: `POST /api/v1/sms { action: "send", recipientMode: "${recipientMode}", confirmed: true, recipients: ${p.recipientCount} }`,
          },
        ],
        confidenceLevel: "CONFIRMED",
      });
    }

    // B. Informational SMS & Phone Reachability Queries
    const smsRes = toolkit.getSmsMetrics();
    if (!smsRes.ok || !smsRes.data) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown:
          smsRes.message || "You don't have permission (`sms.view`) to view SMS communications.",
        metricsCited: [],
        proposedActions: [],
      });
    }

    const {
      metrics,
      recipients,
      paymentReminderSentCount,
      overdueWithoutReminder,
    } = smsRes.data;

    // "Which customers have not received their payment reminder?"
    if (/\b(not received|haven't received|without|missing)\b/i.test(q) && /\b(reminder)\b/i.test(q)) {
      const listMd =
        overdueWithoutReminder.length === 0
          ? "All customers with overdue balances have already received a payment reminder SMS."
          : overdueWithoutReminder
              .map(
                (r) =>
                  `- **${r.customerName}** (\`${r.accountNumber}\`) · Phone: \`${r.phone}\` · Balance: **${ctx.currency} ${r.balanceDue.toLocaleString()}** · Package: ${r.packageName}`
              )
              .join("\n");

      return finalize({
        intent: "SMS_COMMUNICATIONS_QUERY",
        headline: `Overdue Customers Pending Payment Reminder (${overdueWithoutReminder.length})`,
        answerMarkdown: `Found **${overdueWithoutReminder.length}** customer(s) with overdue balances who have not yet received a payment reminder SMS:\n\n${listMd}`,
        metricsCited: [
          {
            label: "Pending Reminder",
            value: String(overdueWithoutReminder.length),
          },
          {
            label: "Reminders Sent",
            value: String(paymentReminderSentCount),
          },
        ],
        proposedActions:
          overdueWithoutReminder.length > 0
            ? [
                {
                  actionId: "act-send-missing-reminders",
                  label: `Prepare Payment Reminder SMS for ${overdueWithoutReminder.length} Overdue Customer(s)`,
                  permissionRequired: "sms.send_bulk",
                  requiresConfirmation: true,
                  commandPreview: `POST /api/v1/sms { action: "preview", recipientMode: "OVERDUE_CUSTOMERS" }`,
                },
              ]
            : [],
        confidenceLevel: "CONFIRMED",
      });
    }

    // Default SMS & Phone Reachability Summary
    const validCustomersList = recipients
      .filter((r) => r.phoneValid)
      .slice(0, 6)
      .map(
        (r) =>
          `- **${r.customerName}** (\`${r.accountNumber}\`) — \`${r.formattedPhone}\` (${r.status})`
      )
      .join("\n");

    const missingOrInvalidCount =
      metrics.totalCustomers - metrics.customersWithValidPhone;
    const optedOutMarketingCount =
      metrics.customersWithValidPhone - metrics.customersReachableMarketing;

    return finalize({
      intent: "SMS_COMMUNICATIONS_QUERY",
      headline: `SMS Communications & Customer Phone Reachability Summary`,
      answerMarkdown: `- **Customers with Valid Phone Numbers (SMS Reachable):** **${metrics.customersWithValidPhone}** of **${metrics.totalCustomers}** total subscribers (**${missingOrInvalidCount}** missing/invalid)
- **Marketing Opt-In Subscribers:** **${metrics.customersReachableMarketing}** (**${optedOutMarketingCount}** opted out of promotional SMS)
- **SMS Sent Today (24h):** **${metrics.messagesSentToday}** message(s)
- **SMS Sent This Month (30d):** **${metrics.messagesSentThisMonth}** message(s) (**${paymentReminderSentCount}** payment/suspension reminder(s))
- **Delivery Breakdown:** **${metrics.deliveredCount}** Delivered · **${metrics.pendingCount}** Sent/Pending · **${metrics.failedCount}** Failed (${metrics.deliveryRatePercent}% delivery rate)
- **SMS Gateway Status:** **${metrics.providerName}** — ${metrics.statusMessage}\n\n### Verified Subscriber Phone Directory (Sample)\n${validCustomersList}`,
      metricsCited: [
        {
          label: "SMS Reachable",
          value: `${metrics.customersWithValidPhone}/${metrics.totalCustomers}`,
        },
        { label: "Sent Today", value: String(metrics.messagesSentToday) },
        { label: "Sent This Month", value: String(metrics.messagesSentThisMonth) },
        { label: "Payment Reminders", value: String(paymentReminderSentCount) },
      ],
      proposedActions: [],
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 3. EXPLICIT CUSTOMER MATCH OR PRONOUN / FOLLOW-UP RESOLUTION (Rule 46)
  // ==========================================================================
  const allTenantCustomers = dataset.customers.filter(
    (c) => c.organizationId === ctx.organizationId
  );

  // Check if query mentions any customer by account number or name token
  const matchedCustomers = allTenantCustomers.filter((c) => {
    if (q.includes(c.accountNumber.toLowerCase())) return true;
    const tokens = c.fullName
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 4);
    return tokens.some((t) => q.includes(t));
  });

  // Check if query uses a pronoun / deictic reference to the conversation memory
  const hasPronounReference =
    /\b(that customer|that subscriber|this customer|this subscriber|their|they|he|him|his|she|her)\b/i.test(
      q
    );

  let targetSubscriber: EnrichedSubscriberRecord | null = null;
  let isFollowUp = false;

  if (matchedCustomers.length === 1) {
    const res = toolkit.getSubscriber(matchedCustomers[0].id);
    if (!res.ok) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown: res.message || "You don't have permission to view this information.",
        metricsCited: [],
        proposedActions: [],
      });
    }
    targetSubscriber = res.data?.exact || res.data?.matches[0] || null;
  } else if (matchedCustomers.length > 1) {
    // Disambiguate multiple matching customers (Rule 47)
    const searchRes = toolkit.searchCustomers(matchedCustomers[0].fullName.split(" ")[0]);
    const matches = searchRes.data ?? [];
    const listMd = matches
      .map(
        (m) =>
          `- **${m.fullName}** · Account: \`${m.accountNumber}\` · Package: **${m.packageName}** · POP: **${m.popSiteName}**`
      )
      .join("\n");
    return finalize({
      intent: "AMBIGUOUS_QUERY_CLARIFICATION",
      headline: `Multiple Subscribers Found (${matches.length} Matches)`,
      answerMarkdown: `I found **${matches.length}** subscribers matching that name. Which one do you mean?\n\n${listMd}`,
      metricsCited: [{ label: "Matches", value: String(matches.length) }],
      proposedActions: [],
    });
  } else if (
    hasPronounReference &&
    (memory.lastSubscriberId || memory.lastAccountNumber || memory.lastSubscriberName)
  ) {
    const refKey =
      memory.lastSubscriberId ||
      memory.lastAccountNumber ||
      memory.lastSubscriberName ||
      "";
    const res = toolkit.getSubscriber(refKey);
    if (!res.ok) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown: res.message || "You don't have permission to view this information.",
        metricsCited: [],
        proposedActions: [],
      });
    }
    targetSubscriber = res.data?.exact || res.data?.matches[0] || null;
    isFollowUp = Boolean(targetSubscriber);
  }

  if (targetSubscriber) {
    // Update conversation context memory
    memory.lastSubscriberId = targetSubscriber.id;
    memory.lastSubscriberName = targetSubscriber.fullName;
    memory.lastAccountNumber = targetSubscriber.accountNumber;
    memory.lastPackageId = targetSubscriber.packageId;
    memory.lastPackageName = targetSubscriber.packageName;
    memory.lastRouterId = targetSubscriber.routerId || undefined;
    memory.lastRouterName = targetSubscriber.routerName || undefined;

    // 3a. "Why is [customer] offline?" or diagnostic question
    if (/\b(why|offline|down|problem|issue|not working|disconnected)\b/i.test(q)) {
      const diagRes = toolkit.diagnoseSubscriberOffline(targetSubscriber.id);
      const diag = diagRes.data;
      if (!diag) {
        return finalize({
          intent: "SUBSCRIBER_DIAGNOSTIC",
          headline: `Diagnostic Unavailable — ${targetSubscriber.fullName}`,
          answerMarkdown: "Could not retrieve diagnostic telemetry for this subscriber.",
          metricsCited: [],
          proposedActions: [],
        });
      }

      const actions = buildProposedActionsForSubscriber(
        targetSubscriber,
        ctx.currency
      );
      const evidenceBullets = diag.evidence.map((e) => `- ${e}`).join("\n");

      return finalize({
        intent: "SUBSCRIBER_DIAGNOSTIC",
        headline: `Subscriber 360 Diagnostic — ${targetSubscriber.fullName} (${targetSubscriber.accountNumber})`,
        answerMarkdown: `**${targetSubscriber.fullName}** (\`${
          targetSubscriber.accountNumber
        }\`) at **${targetSubscriber.popSiteName}** is currently **${
          targetSubscriber.status
        }** (${
          targetSubscriber.isOnline ? "PPPoE Online" : "Session Offline"
        }) on **${targetSubscriber.packageName}**.\n\n### ${
          diag.confidence === "CONFIRMED" ? "Confirmed Cause" : "Likely Cause"
        }\n${diag.primaryCause}\n\n### Diagnostic Evidence\n${evidenceBullets}\n- **Financial Balance**: ${
          ctx.currency
        } ${targetSubscriber.balanceDue.toLocaleString()}\n- **ONT Optical Signal**: \`${
          targetSubscriber.rxPowerDbm !== null
            ? `${targetSubscriber.rxPowerDbm.toFixed(1)} dBm`
            : "N/A"
        }\`\n- **Connection Quality Score**: **${
          targetSubscriber.qualityScore
        }/100**\n- **Churn Risk**: **${targetSubscriber.churnRiskTier}** (${
          targetSubscriber.churnRiskScore
        }/100)`,
        metricsCited: [
          { label: "Status", value: targetSubscriber.status },
          {
            label: "Balance Due",
            value: `${ctx.currency} ${targetSubscriber.balanceDue.toLocaleString()}`,
          },
          {
            label: "Optical RX",
            value:
              targetSubscriber.rxPowerDbm !== null
                ? `${targetSubscriber.rxPowerDbm.toFixed(1)} dBm`
                : "N/A",
          },
          { label: "QoE Score", value: `${targetSubscriber.qualityScore}/100` },
        ],
        proposedActions: actions,
        confidenceLevel: diag.confidence,
      });
    }

    // 3b. Specific follow-up questions about the subscriber (Package, IP, Online, Last Payment, Expiry)
    if (isFollowUp || /\b(what package|which package|what plan|their ip|his ip|her ip|are they online|is he online|is she online|when did they last pay|how much did he pay|how much did she pay|when does their service expire|when does it expire)\b/i.test(q)) {
      if (/\b(package|plan|speed)\b/i.test(q)) {
        return finalize({
          intent: "CONTEXTUAL_FOLLOW_UP",
          headline: `Active Package — ${targetSubscriber.fullName} (${targetSubscriber.accountNumber})`,
          answerMarkdown: `**${targetSubscriber.fullName}** (\`${targetSubscriber.accountNumber}\`) is subscribed to **${targetSubscriber.packageName}**.\n- **Service Type:** ${targetSubscriber.serviceType}\n- **Provisioned Speed:** ${targetSubscriber.speedMbpsLabel}\n- **Plan Rate:** ${ctx.currency} ${targetSubscriber.packagePrice.toLocaleString()}\n- **Subscription Status:** ${targetSubscriber.status}\n- **Next Expiry:** ${formatDateOnly(targetSubscriber.expiresAt, ctx.timezone)}`,
          metricsCited: [
            { label: "Subscriber", value: targetSubscriber.fullName },
            { label: "Package", value: targetSubscriber.packageName },
            { label: "Rate", value: `${ctx.currency} ${targetSubscriber.packagePrice.toLocaleString()}` },
          ],
          proposedActions: [],
          confidenceLevel: "CONFIRMED",
        });
      }

      if (/\b(ip|ip address|mac)\b/i.test(q)) {
        toolkit.getCustomerSessions(targetSubscriber.id);
        return finalize({
          intent: "CONTEXTUAL_FOLLOW_UP",
          headline: `Network Addressing — ${targetSubscriber.fullName} (${targetSubscriber.accountNumber})`,
          answerMarkdown: `**${targetSubscriber.fullName}** (\`${targetSubscriber.accountNumber}\`):\n- **Assigned IP Address:** ${
            targetSubscriber.ipAddress ? `\`${targetSubscriber.ipAddress}\`` : "No active IP (session offline)"
          }\n- **MAC / CPE Serial:** ${
            targetSubscriber.macAddress ? `\`${targetSubscriber.macAddress}\`` : "Not recorded"
          }\n- **PPPoE Username:** \`${targetSubscriber.pppoeUsername || "—"}\`\n- **Router:** ${
            targetSubscriber.routerName || "—"
          } (${targetSubscriber.popSiteName})\n- **Session State:** ${targetSubscriber.sessionStatus}`,
          metricsCited: [
            { label: "IP Address", value: targetSubscriber.ipAddress || "Offline" },
            { label: "Session", value: targetSubscriber.sessionStatus },
            { label: "Router", value: targetSubscriber.routerName || "—" },
          ],
          proposedActions: [],
          confidenceLevel: "CONFIRMED",
        });
      }

      if (/\b(online|connected|session|active right now)\b/i.test(q)) {
        toolkit.getCustomerSessions(targetSubscriber.id);
        return finalize({
          intent: "CONTEXTUAL_FOLLOW_UP",
          headline: `Live Session Status — ${targetSubscriber.fullName} (${targetSubscriber.accountNumber})`,
          answerMarkdown: `**${targetSubscriber.fullName}** (\`${
            targetSubscriber.accountNumber
          }\`) is currently **${targetSubscriber.sessionStatus.toUpperCase()}**.\n- **Account Status:** ${
            targetSubscriber.status
          }\n- **IP Address:** ${
            targetSubscriber.ipAddress ? `\`${targetSubscriber.ipAddress}\`` : "None (Offline)"
          }\n- **Session Uptime:** ${
            targetSubscriber.uptime || "0s"
          }\n- **Serving Router:** ${
            targetSubscriber.routerName || "—"
          } (${targetSubscriber.popSiteName})`,
          metricsCited: [
            { label: "Session", value: targetSubscriber.sessionStatus },
            { label: "IP", value: targetSubscriber.ipAddress || "—" },
            { label: "Uptime", value: targetSubscriber.uptime || "0s" },
          ],
          proposedActions: buildProposedActionsForSubscriber(
            targetSubscriber,
            ctx.currency
          ),
          confidenceLevel: "CONFIRMED",
        });
      }

      if (/\b(pay|paid|payment|balance)\b/i.test(q)) {
        const payRes = toolkit.getCustomerPayments(targetSubscriber.id);
        if (!payRes.ok) {
          return finalize({
            intent: "PERMISSION_DENIED",
            headline: "Permission Required",
            answerMarkdown: payRes.message || "You don't have permission to view payment records.",
            metricsCited: [],
            proposedActions: [],
          });
        }
        const payments = payRes.data ?? [];
        const latest = payments[0];
        return finalize({
          intent: "CONTEXTUAL_FOLLOW_UP",
          headline: `Payment History — ${targetSubscriber.fullName} (${targetSubscriber.accountNumber})`,
          answerMarkdown: latest
            ? `**${targetSubscriber.fullName}** (\`${targetSubscriber.accountNumber}\`) last paid **${
                ctx.currency
              } ${latest.amount.toLocaleString()}** on **${formatDateTimeEAT(
                latest.processedAt || latest.createdAt,
                ctx.timezone
              )}**.\n- **Transaction Reference:** \`${latest.transactionReference}\`\n- **Payment Channel:** ${
                latest.paymentMethod
              }\n- **Payment Status:** ${targetSubscriber.paymentStatus}\n- **Current Balance Due:** ${
                ctx.currency
              } ${targetSubscriber.balanceDue.toLocaleString()}`
            : `No completed payment records were found for **${targetSubscriber.fullName}** (\`${
                targetSubscriber.accountNumber
              }\`).\n- **Current Balance Due:** ${
                ctx.currency
              } ${targetSubscriber.balanceDue.toLocaleString()} (${targetSubscriber.paymentStatus})`,
          metricsCited: [
            {
              label: "Last Payment",
              value: latest ? `${ctx.currency} ${latest.amount.toLocaleString()}` : "None",
            },
            { label: "Reference", value: latest ? latest.transactionReference : "—" },
            {
              label: "Balance Due",
              value: `${ctx.currency} ${targetSubscriber.balanceDue.toLocaleString()}`,
            },
          ],
          proposedActions: [],
          confidenceLevel: "CONFIRMED",
        });
      }

      if (/\b(expire|expiry|expiration|renew)\b/i.test(q)) {
        return finalize({
          intent: "CONTEXTUAL_FOLLOW_UP",
          headline: `Subscription Expiry — ${targetSubscriber.fullName} (${targetSubscriber.accountNumber})`,
          answerMarkdown: `**${targetSubscriber.fullName}** (\`${targetSubscriber.accountNumber}\`) service expiry details:\n- **Next Expiry Date:** **${formatDateTimeEAT(
            targetSubscriber.expiresAt,
            ctx.timezone
          )}**\n- **Package:** ${targetSubscriber.packageName}\n- **Subscription Status:** ${
            targetSubscriber.status
          }\n- **Balance Due:** ${ctx.currency} ${targetSubscriber.balanceDue.toLocaleString()}`,
          metricsCited: [
            {
              label: "Expiry Date",
              value: formatDateOnly(targetSubscriber.expiresAt, ctx.timezone),
            },
            { label: "Status", value: targetSubscriber.status },
          ],
          proposedActions: [],
          confidenceLevel: "CONFIRMED",
        });
      }
    }

    // 3c. Full Customer 360 Dossier (Rule 10)
    const c360Res = toolkit.getCustomer360(targetSubscriber.id);
    const c360 = c360Res.data;
    const actions = buildProposedActionsForSubscriber(
      targetSubscriber,
      ctx.currency
    );

    return finalize({
      intent:
        /\b(everything|360|tell me about|profile|details)\b/i.test(q)
          ? "CUSTOMER_360_DOSSIER"
          : "SUBSCRIBER_DIAGNOSTIC",
      headline: `Subscriber 360 Dossier — ${targetSubscriber.fullName} (${targetSubscriber.accountNumber})`,
      answerMarkdown: `${formatEnrichedSubscriberMarkdown(
        targetSubscriber,
        ctx,
        "Customer 360 Summary"
      )}\n- **Open Support Tickets:** ${
        c360 ? c360.tickets.filter((t) => t.status !== "RESOLVED").length : targetSubscriber.openTicketsCount
      }\n- **Connection Quality Score:** **${targetSubscriber.qualityScore}/100**\n- **Churn Risk:** **${
        targetSubscriber.churnRiskTier
      }** (${targetSubscriber.churnRiskScore}/100)`,
      metricsCited: [
        { label: "Status", value: targetSubscriber.status },
        {
          label: "Balance Due",
          value: `${ctx.currency} ${targetSubscriber.balanceDue.toLocaleString()}`,
        },
        {
          label: "Optical RX",
          value:
            targetSubscriber.rxPowerDbm !== null
              ? `${targetSubscriber.rxPowerDbm.toFixed(1)} dBm`
              : "N/A",
        },
        { label: "QoE Score", value: `${targetSubscriber.qualityScore}/100` },
      ],
      proposedActions: actions,
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 4. CHURN RISK & OPTICAL ATTENUATION AUDIT
  // ==========================================================================
  if (
    q.includes("churn") ||
    q.includes("attenuation") ||
    q.includes("optical") ||
    q.includes("degraded")
  ) {
    const churnRes = toolkit.getChurnMetrics();
    if (!churnRes.ok) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown: churnRes.message || "You don't have permission to view subscriber metrics.",
        metricsCited: [],
        proposedActions: [],
      });
    }
    const atRisk = churnRes.data?.atRiskSubscribers ?? [];
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
                }/100** · Optical \`${
                  s.rxPowerDbm !== null ? `${s.rxPowerDbm.toFixed(1)} dBm` : "N/A"
                }\` · Balance **${ctx.currency} ${s.balanceDue.toLocaleString()}**`
            )
            .join("\n");

    return finalize({
      intent: "CHURN_AND_OPTICAL_AUDIT",
      headline: `Proactive Retention & Optical Health Audit (${atRisk.length} Flagged)`,
      answerMarkdown: `Identified **${atRisk.length}** subscriber(s) requiring retention or fiber link intervention:\n${listText}`,
      metricsCited: [
        { label: "At-Risk Subscribers", value: String(atRisk.length) },
        {
          label: "Total Subscribers",
          value: String(churnRes.data?.totalSubscribers ?? 0),
        },
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
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 5. OVERDUE ACCOUNTS & "WHO OWES THE MOST?" (Rules 16, 18, 21, 41)
  // ==========================================================================
  if (
    /\b(overdue|owe|owes|arrears|unpaid|not paid|largest overdue|delinquent)\b/i.test(
      q
    ) &&
    !/\b(online)\b/i.test(q)
  ) {
    const overdueRes = toolkit.getOverdueAccounts(10);
    if (!overdueRes.ok) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown:
          overdueRes.message || "You don't have permission to view billing records.",
        metricsCited: [],
        proposedActions: [],
      });
    }
    const list = overdueRes.data ?? [];
    if (list.length === 0) {
      return finalize({
        intent: "OVERDUE_ACCOUNTS_RANKING",
        headline: "Zero Overdue Subscriber Accounts",
        answerMarkdown:
          "All subscriber accounts currently have a zero overdue balance (`KES 0`).",
        metricsCited: [{ label: "Overdue Accounts", value: "0" }],
        proposedActions: [],
        confidenceLevel: "CONFIRMED",
      });
    }

    const topDebtor = list[0];
    memory.lastSubscriberId = topDebtor.id;
    memory.lastSubscriberName = topDebtor.fullName;
    memory.lastAccountNumber = topDebtor.accountNumber;

    const totalOverdue = list.reduce((sum, s) => sum + s.balanceDue, 0);
    const tableRows = list
      .map(
        (s) =>
          `| **${s.fullName}** (\`${s.accountNumber}\`) | **${ctx.currency} ${s.balanceDue.toLocaleString()}** | ${s.packageName} | ${s.daysOverdue} days | ${s.serviceType} (${s.status}) |`
      )
      .join("\n");

    return finalize({
      intent: "OVERDUE_ACCOUNTS_RANKING",
      headline: `Overdue Accounts Ranked by Balance (${list.length} Account(s))`,
      answerMarkdown: `Highest outstanding balance: **${topDebtor.fullName}** (\`${
        topDebtor.accountNumber
      }\`) owing **${ctx.currency} ${topDebtor.balanceDue.toLocaleString()}**.\n\n| Customer | Balance | Package | Days Overdue | Service |\n| :--- | ---: | :--- | ---: | :--- |\n${tableRows}`,
      metricsCited: [
        { label: "Highest Arrears", value: `${topDebtor.fullName}` },
        {
          label: "Top Balance",
          value: `${ctx.currency} ${topDebtor.balanceDue.toLocaleString()}`,
        },
        {
          label: "Total Overdue",
          value: `${ctx.currency} ${totalOverdue.toLocaleString()}`,
        },
        { label: "Overdue Count", value: String(list.length) },
      ],
      proposedActions: buildProposedActionsForSubscriber(topDebtor, ctx.currency),
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 6. ONLINE / OFFLINE / SUSPENDED / EXPIRED SUBSCRIBERS (Rules 14, 21, 23, 41)
  // ==========================================================================
  if (
    /\b(online|connected right now|active sessions|currently offline|customers offline|who is offline|suspended subscribers|suspended customers|expired subscribers)\b/i.test(
      q
    ) &&
    !/\b(where can i|how do i|router)\b/i.test(q)
  ) {
    // Online + overdue cross-module check
    if (/\b(overdue|balance|unpaid)\b/i.test(q)) {
      const res = toolkit.searchSubscribers({ isOnline: true, overdueOnly: true });
      if (!res.ok) {
        return finalize({
          intent: "PERMISSION_DENIED",
          headline: "Permission Required",
          answerMarkdown: res.message || "You don't have permission to view this information.",
          metricsCited: [],
          proposedActions: [],
        });
      }
      const matches = res.data ?? [];
      return finalize({
        intent: "SUBSCRIBER_LIST_FILTER",
        headline: `Online Subscribers with Overdue Balances (${matches.length})`,
        answerMarkdown:
          matches.length === 0
            ? "There are currently **0** online subscribers with overdue balances. Automated billing enforcement has suspended overdue accounts."
            : matches
                .map(
                  (s) =>
                    `- **${s.fullName}** (\`${s.accountNumber}\`) · IP: \`${s.ipAddress}\` · Balance: **${ctx.currency} ${s.balanceDue.toLocaleString()}**`
                )
                .join("\n"),
        metricsCited: [{ label: "Online + Overdue", value: String(matches.length) }],
        proposedActions: [],
        confidenceLevel: "CONFIRMED",
      });
    }

    // Offline subscribers table
    if (/\b(offline|disconnected)\b/i.test(q)) {
      const res = toolkit.searchSubscribers({ isOnline: false });
      if (!res.ok) {
        return finalize({
          intent: "PERMISSION_DENIED",
          headline: "Permission Required",
          answerMarkdown: res.message || "You don't have permission to view subscriber sessions.",
          metricsCited: [],
          proposedActions: [],
        });
      }
      const offlineList = res.data ?? [];
      const rows = offlineList
        .map((s) => {
          const diag = toolkit.diagnoseSubscriberOffline(s.id).data;
          return `| **${s.fullName}** (\`${s.accountNumber}\`) | ${s.packageName} | ${
            s.ipAddress || "None"
          } | ${s.status} | ${diag?.primaryCause || "No active session"} |`;
        })
        .join("\n");

      return finalize({
        intent: "SUBSCRIBER_LIST_FILTER",
        headline: `Offline Subscribers (${offlineList.length} Account(s))`,
        answerMarkdown:
          offlineList.length === 0
            ? "All registered subscribers currently have active online sessions."
            : `| Customer | Package | IP | Status | Reason |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}`,
        metricsCited: [{ label: "Offline Subscribers", value: String(offlineList.length) }],
        proposedActions: [],
        confidenceLevel: "CONFIRMED",
      });
    }

    // Suspended subscribers
    if (/\b(suspended)\b/i.test(q)) {
      const res = toolkit.getSuspendedSubscribers();
      if (!res.ok) {
        return finalize({
          intent: "PERMISSION_DENIED",
          headline: "Permission Required",
          answerMarkdown: res.message || "You don't have permission to view this information.",
          metricsCited: [],
          proposedActions: [],
        });
      }
      const list = res.data ?? [];
      return finalize({
        intent: "SUBSCRIBER_LIST_FILTER",
        headline: `Suspended Subscribers (${list.length})`,
        answerMarkdown:
          list.length === 0
            ? "There are currently no suspended subscribers."
            : list
                .map(
                  (s) =>
                    `- **${s.fullName}** (\`${s.accountNumber}\`) · Package: **${s.packageName}** · Balance Due: **${ctx.currency} ${s.balanceDue.toLocaleString()}** · POP: ${s.popSiteName}`
                )
                .join("\n"),
        metricsCited: [{ label: "Suspended Count", value: String(list.length) }],
        proposedActions: [],
        confidenceLevel: "CONFIRMED",
      });
    }

    // Currently Online Subscribers (PPPoE + Hotspot)
    const pppoeRes = toolkit.getActivePPPoESessions();
    const hsRes = toolkit.getActiveHotspotSessions();
    if (!pppoeRes.ok) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown: pppoeRes.message || "You don't have permission to view active sessions.",
        metricsCited: [],
        proposedActions: [],
      });
    }
    const onlinePppoe = pppoeRes.data ?? [];
    const onlineHotspot = hsRes.data ?? [];
    const totalOnline = onlinePppoe.length + onlineHotspot.length;

    const rows = onlinePppoe
      .map(
        (s) =>
          `| **${s.fullName}** (\`${s.accountNumber}\`) | ${s.packageName} | \`${
            s.ipAddress || "—"
          }\` | ${s.routerName || "—"} | ${s.popSiteName} | ${s.uptime || "Active"} |`
      )
      .join("\n");

    return finalize({
      intent: "SUBSCRIBER_LIST_FILTER",
      headline: `${totalOnline} Active Online Sessions (${onlinePppoe.length} PPPoE, ${onlineHotspot.length} Hotspot Voucher)`,
      answerMarkdown: `**${totalOnline} active session(s)** currently online:\n- **PPPoE Subscribers Online:** **${onlinePppoe.length}**\n- **Active Hotspot Voucher Sessions:** **${onlineHotspot.length}**\n\n| Customer | Package | IP Address | Router | POP / Site | Uptime |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${rows}`,
      metricsCited: [
        { label: "Total Online", value: String(totalOnline) },
        { label: "PPPoE Online", value: String(onlinePppoe.length) },
        { label: "Hotspot Online", value: String(onlineHotspot.length) },
      ],
      proposedActions: [],
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 7. PACKAGE POPULARITY & PACKAGE REVENUE (Rules 6, 7, 22, 41)
  // ==========================================================================
  if (/\b(package|packages|plan|plans)\b/i.test(q) && !/\b(how do i|where do i|create)\b/i.test(q)) {
    if (/\b(revenue|money|earning|highest revenue|most money|generate|generated)\b/i.test(q)) {
      const revRes = toolkit.getPackageRevenue();
      if (!revRes.ok) {
        return finalize({
          intent: "PERMISSION_DENIED",
          headline: "Permission Required",
          answerMarkdown:
            revRes.message || "You don't have permission to view package revenue.",
          metricsCited: [],
          proposedActions: [],
        });
      }
      const list = revRes.data ?? [];
      const top = list[0];
      const rows = list
        .map(
          (p, idx) =>
            `| ${idx + 1} | **${p.planName}** (${p.serviceType}) | ${p.currency} ${p.price.toLocaleString()} | ${
              p.subscriberCount
            } | **${p.currency} ${p.confirmedPaymentsCollected.toLocaleString()}** | ${
              p.currency
            } ${p.contractedMrr.toLocaleString()} |`
        )
        .join("\n");

      return finalize({
        intent: "PACKAGE_ANALYTICS",
        headline: `Package Revenue Intelligence — Top Earner: ${top?.planName || "N/A"}`,
        answerMarkdown: `Ranked by confirmed payments and contracted Monthly Recurring Revenue (MRR):\n\n| # | Package | Price | Subscribers | Confirmed Collections | Contracted MRR |\n| :--- | :--- | ---: | ---: | ---: | ---: |\n${rows}`,
        metricsCited: top
          ? [
              { label: "Top Package", value: top.planName },
              {
                label: "Confirmed Collected",
                value: `${top.currency} ${top.confirmedPaymentsCollected.toLocaleString()}`,
              },
              {
                label: "Contracted MRR",
                value: `${top.currency} ${top.contractedMrr.toLocaleString()}`,
              },
            ]
          : [],
        proposedActions: [],
        confidenceLevel: "CONFIRMED",
      });
    }

    // Most popular packages by subscriber count
    const pkgRes = toolkit.searchPackages();
    if (!pkgRes.ok) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown: pkgRes.message || "You don't have permission to view packages.",
        metricsCited: [],
        proposedActions: [],
      });
    }
    const list = pkgRes.data ?? [];
    const top = list[0];
    const rankedMd = list
      .map(
        (p, idx) =>
          `${idx + 1}. **${p.name}** (${p.serviceType}) — **${p.totalSubscribers} subscribers** · ${p.currency} ${p.price.toLocaleString()}`
      )
      .join("\n");

    return finalize({
      intent: "PACKAGE_ANALYTICS",
      headline: `Most Popular Service Packages (Ranked by Subscriber Count)`,
      answerMarkdown: `Most popular package: **${top?.name || "N/A"}** with **${
        top?.totalSubscribers ?? 0
      } subscribers**.\n\n${rankedMd}`,
      metricsCited: top
        ? [
            { label: "Most Popular", value: top.name },
            { label: "Subscribers", value: String(top.totalSubscribers) },
            { label: "Total Plans", value: String(list.length) },
          ]
        : [],
      proposedActions: [],
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 8. TODAY'S COLLECTIONS, REVENUE, MRR, ARPU & LEDGER (Rules 18, 24, 35, 41)
  // ==========================================================================
  if (
    /\b(collect|collected|today's revenue|revenue today|payments came in|who paid|revenue|ledger|mrr|arpu|balance|payment|reconcil)\b/i.test(
      q
    ) &&
    !/\b(how does|where can i|where do i)\b/i.test(q)
  ) {
    const revRes = toolkit.getRevenueMetrics();
    if (!revRes.ok || !revRes.data) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown:
          revRes.message || "You don't have permission to view financial and billing records.",
        metricsCited: [],
        proposedActions: [],
      });
    }
    const f = revRes.data;

    if (
      /\b(today|collected today|collect today|came in today|paid recently)\b/i.test(q) &&
      !/\b(mrr|arpu|trial balance|ledger)\b/i.test(q)
    ) {
      const latestPays = toolkit.getLatestPayments(5).data ?? [];
      const methodLines = Object.entries(f.todayByMethod)
        .map(([m, amt]) => `- **${m}:** ${f.currency} ${amt.toLocaleString()}`)
        .join("\n");
      const recentTxLines = latestPays
        .map(
          (p) =>
            `- \`${p.transactionReference}\` · **${p.customerName || p.senderName || "Hotspot"}** · **${
              p.currency
            } ${p.amount.toLocaleString()}** (${p.paymentMethod}, ${p.status})`
        )
        .join("\n");

      return finalize({
        intent: "TODAYS_COLLECTIONS_SUMMARY",
        headline: `Today's Confirmed Collections: ${f.currency} ${f.collectedToday.toLocaleString()}`,
        answerMarkdown: `**Today's collections (last 24h): ${f.currency} ${f.collectedToday.toLocaleString()}**\n${
          methodLines || `- **M-Pesa:** ${f.currency} ${f.collectedToday.toLocaleString()}`
        }\n- **Confirmed Transactions (24h):** ${f.todayTransactionsCount}\n- **Failed Payments:** ${
          f.failedPaymentsCount
        }\n\n### Recent Confirmed Transactions\n${recentTxLines || "No transactions recorded."}`,
        metricsCited: [
          {
            label: "Collected (24h)",
            value: `${f.currency} ${f.collectedToday.toLocaleString()}`,
          },
          { label: "Transactions", value: String(f.todayTransactionsCount) },
          {
            label: "Period Collections",
            value: `${f.currency} ${f.collectedThisPeriod.toLocaleString()}`,
          },
          { label: "Failed Payments", value: String(f.failedPaymentsCount) },
        ],
        proposedActions: [],
        confidenceLevel: "CONFIRMED",
      });
    }

    return finalize({
      intent: "REVENUE_AND_LEDGER_SUMMARY",
      headline: "Double-Entry Financial Ledger & Revenue Intelligence Summary",
      answerMarkdown: `- **Monthly Recurring Revenue (MRR)**: **${f.currency} ${f.mrr.toLocaleString()}** (ARR: **${f.currency} ${f.arr.toLocaleString()}**, ARPU: **${f.currency} ${f.arpu.toLocaleString()}** — *calculated as monthly recurring subscription revenue ÷ active subscribers*)
- **Collections & Efficiency**: **${f.currency} ${f.collectedThisPeriod.toLocaleString()}** collected (${f.collectionRatePercent}% collection rate)
- **Accounts Receivable Outstanding**: **${f.currency} ${f.totalArOutstanding.toLocaleString()}**
- **Double-Entry Trial Balance**: **${
        f.trialBalanceBalanced ? "BALANCED (0.00 discrepancy)" : "DISCREPANCY DETECTED"
      }**
- **Governance Queue**: **${f.unmatchedPaymentsCount}** unmatched payment(s) · **${
        f.pendingApprovalsCount
      }** Maker-Checker approval request(s)`,
      metricsCited: [
        { label: "MRR", value: `${f.currency} ${f.mrr.toLocaleString()}` },
        { label: "ARPU", value: `${f.currency} ${f.arpu.toLocaleString()}` },
        { label: "Collection Rate", value: `${f.collectionRatePercent}%` },
        {
          label: "AR Outstanding",
          value: `${f.currency} ${f.totalArOutstanding.toLocaleString()}`,
        },
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
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 9. ROUTER SESSIONS, UNHEALTHY ROUTERS, OUTAGES & NETWORK HEALTH (Rules 19, 44)
  // ==========================================================================
  if (
    /\b(router|routers|olt|outage|outages|network|blast|noc|unhealthy|active sessions|affected)\b/i.test(
      q
    ) &&
    !/\b(how do i|where can i|where do i)\b/i.test(q)
  ) {
    const rtrHealthRes = toolkit.getRouterHealth();
    const rtrSessionsRes = toolkit.getRouterSessions();
    const incidentsRes = toolkit.getNetworkIncidents();

    if (!rtrHealthRes.ok) {
      return finalize({
        intent: "PERMISSION_DENIED",
        headline: "Permission Required",
        answerMarkdown:
          rtrHealthRes.message || "You don't have permission to view router and NOC telemetry.",
        metricsCited: [],
        proposedActions: [],
      });
    }

    const routers = rtrHealthRes.data ?? [];
    const routerSessions = rtrSessionsRes.data ?? [];
    const incidents = incidentsRes.data;

    // 9a. "Which router has the most active sessions?"
    if (/\b(most active sessions|most sessions|highest sessions)\b/i.test(q)) {
      const topRtr = routerSessions[0];
      const rows = routerSessions
        .map(
          (r, i) =>
            `| ${i + 1} | **${r.routerName}** | ${r.siteName || "—"} | **${
              r.totalActiveSessions
            }** | ${r.cpuLoad}% | ${r.status} |`
        )
        .join("\n");

      return finalize({
        intent: "ROUTER_SESSIONS_AND_HEALTH",
        headline: `Router Session Ranking — Top: ${topRtr?.routerName || "N/A"} (${
          topRtr?.totalActiveSessions ?? 0
        } Active Sessions)`,
        answerMarkdown: `**${topRtr?.routerName || "N/A"}** at **${
          topRtr?.siteName || "—"
        }** carries the highest load with **${
          topRtr?.totalActiveSessions ?? 0
        } active sessions**.\n\n| # | Router | POP / Site | Active Sessions | CPU Load | Status |\n| :--- | :--- | :--- | ---: | ---: | :--- |\n${rows}`,
        metricsCited: topRtr
          ? [
              { label: "Top Router", value: topRtr.routerName },
              { label: "Active Sessions", value: String(topRtr.totalActiveSessions) },
              { label: "CPU Load", value: `${topRtr.cpuLoad}%` },
            ]
          : [],
        proposedActions: [],
        confidenceLevel: "CONFIRMED",
      });
    }

    // 9b. "Which routers are unhealthy?" / "Are there any active outages?" / "Which customers are affected?"
    if (
      /\b(unhealthy|causing the most problems|outage|outages|affected|having problems)\b/i.test(
        q
      )
    ) {
      const flaggedRouters = routers.filter((r) => !r.isHealthy || r.cpuLoad >= 40);
      const losOnts = incidents?.losOnts ?? [];
      const degradedNodes = incidents?.degradedNodes ?? [];
      const openAlerts = incidents?.openAlerts ?? [];

      const rtrLines =
        flaggedRouters.length === 0
          ? "- All MikroTik BNG routers are `ONLINE` with normal CPU/memory utilization."
          : flaggedRouters
              .map(
                (r) =>
                  `- **${r.name}** (${r.siteName}): Status \`${r.status}\` · CPU **${
                    r.cpuLoad
                  }%** · Active Sessions: **${r.activeSessions}** · Flags: ${
                    r.unhealthyReasons.join(", ") || "None"
                  }`
              )
              .join("\n");

      const ontLines =
        losOnts.length === 0
          ? "- Zero GPON ONT optical Loss-of-Signal (`LOS`) alarms."
          : losOnts
              .map(
                (o) =>
                  `- **${o.customerName}** (\`${o.accountNumber}\`): ONT \`${
                    o.serialNumber
                  }\` on \`${o.ponPortLabel}\` (${o.oltName}) reporting **${
                    o.status
                  } (${o.rxPowerDbm.toFixed(1)} dBm)**`
              )
              .join("\n");

      const nodeLines =
        degradedNodes.length === 0
          ? "- All fiber distribution splitters (NAP/FAT) are operating normally."
          : degradedNodes
              .map(
                (n) =>
                  `- **${n.name}** (\`${n.nodeCode}\`): Status **${n.status}** · Latency **${n.latencyMs} ms** · Utilization **${n.utilizationPercent}%** · **${n.subscriberCount} subscribers** on node`
              )
              .join("\n");

      return finalize({
        intent: "NETWORK_AND_OUTAGE_STATUS",
        headline: `Active Network Incidents, Router Health & Affected Subscribers`,
        answerMarkdown: `### Router Fleet Warnings\n${rtrLines}\n\n### Fiber Distribution & Topology Alerts\n${nodeLines}\n\n### Affected Subscribers (Optical LOS / Outage)\n${ontLines}`,
        metricsCited: [
          {
            label: "Routers Online",
            value: `${routers.filter((r) => r.status === "ONLINE").length}/${routers.length}`,
          },
          { label: "ONT LOS Alarms", value: String(losOnts.length) },
          { label: "Degraded Nodes", value: String(degradedNodes.length) },
          { label: "Open NOC Alerts", value: String(openAlerts.length) },
        ],
        proposedActions: [],
        confidenceLevel: "CONFIRMED",
      });
    }

    // 9c. General Network & NOC Status (backward-compatible with Phase 6 test)
    const onlineRoutersCount = routers.filter((r) => r.status === "ONLINE").length;
    const oltsCount = dataset.olts.filter(
      (o) => o.organizationId === ctx.organizationId
    ).length;
    const losOntCount = (incidents?.losOnts ?? []).length;
    const openAlertsCount = (incidents?.openAlerts ?? []).length;

    const overallHealth =
      onlineRoutersCount < routers.length
        ? "Critical"
        : losOntCount > 0 || openAlertsCount > 0
        ? "Warning"
        : "Healthy";

    return finalize({
      intent: "NETWORK_AND_OUTAGE_STATUS",
      headline: "NOC Control Plane, MikroTik Fleet & GPON OLT Telemetry",
      answerMarkdown: `- **Overall Network Status**: **${overallHealth}**
- **MikroTik BNG Fleet**: **${onlineRoutersCount}/${routers.length}** routers online via WireGuard tunnel
- **GPON/XGS-PON OLTs**: **${oltsCount}** chassis active · **${losOntCount}** ONT(s) with optical alarm
- **Active NOC Alerts**: **${openAlertsCount}** open alert(s) correlated across topology tree`,
      metricsCited: [
        {
          label: "Routers Online",
          value: `${onlineRoutersCount}/${routers.length}`,
        },
        { label: "Active OLTs", value: String(oltsCount) },
        { label: "ONT Alarms", value: String(losOntCount) },
        { label: "Open Alerts", value: String(openAlertsCount) },
      ],
      proposedActions: [],
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 10. BUSINESS PERFORMANCE EXECUTIVE SUMMARY (Rule 45)
  // ==========================================================================
  if (/\b(how is the business performing|business performance|executive summary)\b/i.test(q)) {
    const growth = toolkit.getCustomerGrowth().data;
    const rev = toolkit.getRevenueMetrics().data;
    const churn = toolkit.getChurnMetrics().data;
    const routers = toolkit.getRouterHealth().data ?? [];

    return finalize({
      intent: "BUSINESS_PERFORMANCE_SUMMARY",
      headline: `${ctx.organizationName} — Executive Business & Operations Performance`,
      answerMarkdown: `### 1. Subscriber Base & Retention\n- **Total Subscribers:** **${
        growth?.totalCustomers ?? 0
      }** (**${growth?.activeCustomers ?? 0}** active, **${
        growth?.suspendedCustomers ?? 0
      }** suspended, **${
        growth?.pendingInstallations ?? 0
      }** pending installation)\n- **Retention & Churn Risk:** **${
        churn?.atRiskCount ?? 0
      }** subscriber(s) flagged for proactive retention or optical link attention\n\n### 2. Financial Performance\n- **Monthly Recurring Revenue (MRR):** **${
        ctx.currency
      } ${(rev?.mrr ?? 0).toLocaleString()}** (ARR: **${ctx.currency} ${(
        rev?.arr ?? 0
      ).toLocaleString()}**)\n- **ARPU:** **${ctx.currency} ${(
        rev?.arpu ?? 0
      ).toLocaleString()}**\n- **Collections Efficiency:** **${
        rev?.collectionRatePercent ?? 0
      }%** (**${ctx.currency} ${(
        rev?.collectedThisPeriod ?? 0
      ).toLocaleString()}** collected)\n- **Outstanding Accounts Receivable:** **${
        ctx.currency
      } ${(rev?.totalArOutstanding ?? 0).toLocaleString()}**\n\n### 3. Network Infrastructure Availability\n- **MikroTik BNG Routers:** **${
        routers.filter((r) => r.status === "ONLINE").length
      }/${routers.length}** online`,
      metricsCited: [
        {
          label: "Active Subscribers",
          value: `${growth?.activeCustomers ?? 0}/${growth?.totalCustomers ?? 0}`,
        },
        { label: "MRR", value: `${ctx.currency} ${(rev?.mrr ?? 0).toLocaleString()}` },
        { label: "ARPU", value: `${ctx.currency} ${(rev?.arpu ?? 0).toLocaleString()}` },
        { label: "Collection Rate", value: `${rev?.collectionRatePercent ?? 0}%` },
      ],
      proposedActions: [],
      confidenceLevel: "CONFIRMED",
    });
  }

  // ==========================================================================
  // 11. FEATURE EXPLANATION & NAVIGATION ASSISTANCE (Rules 11, 12, 42, 43)
  // ==========================================================================
  if (
    /\b(how does|how do i|where do i|where can i|what does this|explain|configure|captive portal|add a subscriber|create a package|connect a mikrotik|reconcile a payment)\b/i.test(
      q
    )
  ) {
    const capRes = toolkit.getFeatureCapabilities(prompt);
    const matched = capRes.data?.[0];
    if (matched) {
      const howSteps = matched.howItWorks.map((s) => `- ${s}`).join("\n");
      const actionsList = matched.availableActions.map((a) => `- ${a}`).join("\n");

      return finalize({
        intent: "FEATURE_AND_NAVIGATION_GUIDE",
        headline: `${matched.featureName} — Navigation & Implementation Guide`,
        answerMarkdown: `- **Application Route:** \`${matched.route}\`${
          matched.apiEndpoints.length > 0
            ? ` (APIs: \`${matched.apiEndpoints.join("`, `")}\`)`
            : ""
        }\n- **Module:** ${matched.module}\n- **Overview:** ${
          matched.description
        }\n\n### How It Works in QC NetCore\n${howSteps}\n\n### Available Operator Actions\n${actionsList}\n\n### Authoritative Data Sources & Permissions\n- **Tables / Sources:** \`${matched.authoritativeDataSources.join(
          "`, `"
        )}\`\n- **Required RBAC Permissions:** \`${matched.requiredPermissions.join(
          "`, `"
        )}\`\n- **Configuration Prerequisite:** ${matched.configurationRequirements.join(
          " "
        )}`,
        metricsCited: [
          { label: "Route", value: matched.route },
          { label: "Module", value: matched.module },
        ],
        proposedActions: [],
        confidenceLevel: "CONFIRMED",
      });
    }
  }

  // ==========================================================================
  // 12. DEFAULT: UNIFIED GLOBAL SEARCH OR GENERAL OPERATIONS BRIEF
  // ==========================================================================
  const allSubs = toolkit.searchCustomers("").data ?? [];
  const rev = toolkit.getRevenueMetrics().data;
  const routers = toolkit.getRouterHealth().data ?? [];
  const incidents = toolkit.getNetworkIncidents().data;

  const onlineSubsCount = allSubs.filter((s) => s.isOnline).length;
  const activeSubsCount = allSubs.filter((s) => s.status === "ACTIVE").length;
  const onlineRoutersCount = routers.filter((r) => r.status === "ONLINE").length;

  return finalize({
    intent: "GENERAL_OPERATIONS_BRIEF",
    headline: `${ctx.organizationName} — Live ISP Operating System Brief`,
    answerMarkdown: `- **Subscribers**: **${allSubs.length}** total (**${activeSubsCount}** active, **${onlineSubsCount}** online sessions)
- **Financials**: **${ctx.currency} ${(rev?.mrr ?? 0).toLocaleString()}** MRR · **${
      rev?.collectionRatePercent ?? 0
    }%** collection rate · Trial Balance **${
      rev?.trialBalanceBalanced ? "Verified" : "Check Needed"
    }**
- **Network & Fiber**: **${onlineRoutersCount}/${
      routers.length
    }** MikroTik routers online · **${dataset.olts.length}** OLT(s) monitored`,
    metricsCited: [
      { label: "MRR", value: `${ctx.currency} ${(rev?.mrr ?? 0).toLocaleString()}` },
      {
        label: "Online Sessions",
        value: `${onlineSubsCount}/${allSubs.length}`,
      },
      {
        label: "Routers Online",
        value: `${onlineRoutersCount}/${routers.length}`,
      },
      {
        label: "Open Alerts",
        value: String(incidents?.openAlerts.length ?? 0),
      },
    ],
    proposedActions: [],
    confidenceLevel: "CONFIRMED",
  });
}

/**
 * Backward-compatible synchronous entry point `runCopilotQuery(prompt, snapshot?, memory?)`
 * used by UI components and unit tests.
 */
export function runCopilotQuery(
  prompt: string,
  ctxSnapshot?: CopilotContextSnapshot,
  memory?: CopilotConversationMemory,
  options?: { userRole?: UserRole; organizationId?: string }
): CopilotResponse {
  const env = ctxSnapshot
    ? adaptSnapshotToEnvironment(ctxSnapshot)
    : buildDemoCopilotEnvironment({
        userRole: options?.userRole,
        organizationId: options?.organizationId,
      });

  if (options?.userRole) {
    env.ctx.userRole = options.userRole;
  }

  return executeCopilotIntelligence({
    prompt,
    ctx: env.ctx,
    dataset: env.dataset,
    memory,
  });
}
