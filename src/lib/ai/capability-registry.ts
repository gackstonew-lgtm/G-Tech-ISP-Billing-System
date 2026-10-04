// ============================================================================
// QC NETCORE — SOFTWARE-AWARENESS LAYER & SYSTEM CAPABILITY REGISTRY
// ============================================================================
// Machine-readable map of QC NetCore modules, routes, features, supported
// actions, required RBAC permissions, authoritative data sources, and
// implementation-grounded explanations. Prevents the AI Copilot from inventing
// non-existent routes or unsupported capabilities.
// ============================================================================

import type { Permission } from "../auth/rbac";

export interface FeatureCapabilityDefinition {
  id: string;
  featureName: string;
  module: string;
  route: string;
  apiEndpoints: string[];
  description: string;
  whyItExists: string;
  howItWorks: string[];
  availableActions: string[];
  requiredPermissions: Permission[];
  authoritativeDataSources: string[];
  dependencies: string[];
  configurationRequirements: string[];
  keywords: string[];
}

export const SYSTEM_CAPABILITY_REGISTRY: FeatureCapabilityDefinition[] = [
  {
    id: "subscriber-management",
    featureName: "Subscriber & Customer Management",
    module: "Customer Management",
    route: "/customers",
    apiEndpoints: ["/api/v1/subscribers-api"],
    description:
      "End-to-end CRM and subscriber lifecycle management for PPPoE fiber/wireless and Hotspot customers.",
    whyItExists:
      "Centralizes customer identity, account numbers (GT-XXXX), installation addresses, POP site mapping, service status, and account balances in a single multi-tenant repository.",
    howItWorks: [
      "Operators register a subscriber on `/customers` with full name, phone number (normalized for M-Pesa), installation address, and assigned POP site.",
      "Each subscriber receives a unique account number (e.g., `GT-8921`) used as the M-Pesa Paybill account reference and PPPoE/RADIUS correlation key.",
      "Subscriber status (`ACTIVE`, `SUSPENDED`, `PENDING_INSTALLATION`, `EXPIRED`, `TERMINATED`) drives automated FreeRADIUS and MikroTik access control.",
    ],
    availableActions: [
      "Create new subscriber (`/customers` -> 'Add Subscriber')",
      "View subscriber profile & Customer 360 dossier",
      "Search & filter subscribers by status, POP site, name, phone, or account number",
      "Suspend or reactivate subscriber service",
      "Assign PPPoE credentials and service plan",
    ],
    requiredPermissions: ["customers.view", "customers.create", "customers.update", "customers.suspend"],
    authoritativeDataSources: ["customers", "subscriptions", "pppoe_accounts", "sites"],
    dependencies: ["Service Plans (`/plans`)", "MikroTik Routers (`/routers`)"],
    configurationRequirements: [
      "At least one POP Site and one Service Plan should be configured before provisioning active PPPoE subscribers.",
    ],
    keywords: [
      "add subscriber",
      "create customer",
      "new subscriber",
      "suspend subscriber",
      "manage customers",
      "where do i add a subscriber",
      "how do i add a subscriber",
      "how do i suspend a subscriber",
    ],
  },
  {
    id: "pppoe-billing",
    featureName: "PPPoE Broadband Billing & Provisioning",
    module: "Services & Billing",
    route: "/plans",
    apiEndpoints: ["/api/v1/service-plans", "/api/v1/subscribers-api", "/api/v1/mpesa-callback"],
    description:
      "Automated recurring billing, bandwidth rate-limiting, and RADIUS/MikroTik session control for home and business PPPoE subscribers.",
    whyItExists:
      "Eliminates manual WinBox queue creation and spreadsheet expiry tracking by linking subscriber invoices and M-Pesa payments directly to FreeRADIUS and MikroTik RouterOS.",
    howItWorks: [
      "1. Plan Definition (`/plans`): Operators define PPPoE plans with download/upload speeds (Kbps), optional burst thresholds, validity duration (e.g., 30 days), and price in KES.",
      "2. MikroTik Rate-Limit Synthesis: QC NetCore automatically generates the deterministic RouterOS `Mikrotik-Rate-Limit` attribute string (e.g., `5120k/10240k`).",
      "3. Subscriber Assignment (`/customers`): A PPPoE account (`pppoe_accounts`) links the customer to a router, username, IP pool or static IP, and service plan.",
      "4. Billing & M-Pesa Renewal (`/billing`): When a subscriber pays via M-Pesa STK Push or Paybill C2B using their account number (`GT-XXXX`), QC NetCore reconciles the invoice, posts a balanced double-entry journal entry, extends subscription `end_time`, and triggers RADIUS CoA / RouterOS reconnection.",
      "5. Automated Expiry Suspension: When `end_time` + grace period elapses with an unpaid balance, the subscription transitions to `SUSPENDED` and active PPPoE sessions are disconnected via RFC 5176 CoA.",
    ],
    availableActions: [
      "Create and edit PPPoE service plans (`/plans`)",
      "Provision PPPoE credentials and static/pool IPs (`/customers`)",
      "Issue invoices and trigger M-Pesa STK Push renewals (`/billing`)",
      "Reset PPPoE sessions via RADIUS CoA disconnect",
    ],
    requiredPermissions: ["plans.view", "plans.modify", "customers.view", "billing.view"],
    authoritativeDataSources: ["plans", "subscriptions", "pppoe_accounts", "invoices", "payments"],
    dependencies: ["FreeRADIUS AAA", "MikroTik RouterOS API / WireGuard", "M-Pesa Daraja API"],
    configurationRequirements: [
      "Configure PPPoE plans on `/plans`, connect a MikroTik BNG router on `/routers`, and set M-Pesa Paybill/Till settings on `/settings`.",
    ],
    keywords: [
      "pppoe billing",
      "how does pppoe billing work",
      "pppoe",
      "create a package",
      "how do i create a package",
      "service plan",
      "rate limit",
    ],
  },
  {
    id: "hotspot-vouchers-captive",
    featureName: "Hotspot Billing, Vouchers & Multi-Tenant Captive Portal",
    module: "Hotspot & WiFi Marketing",
    route: "/settings/captive-portal",
    apiEndpoints: [
      "/api/v1/captive/config",
      "/api/v1/captive/assets",
      "/api/v1/captive/public",
      "/api/v1/mpesa-stk-push",
    ],
    description:
      "Customizable multi-tenant Hotspot Captive Portal (`/captive`) with instant M-Pesa STK Push package checkout and prepaid voucher batch management (`/vouchers`).",
    whyItExists:
      "Allows every onboarded ISP to brand its own hotspot login portal, sell time/data-bound Wi-Fi packages (Daily Basic, Weekly Plus, Monthly Pro), and authenticate users via Voucher, M-Pesa, or Account login.",
    howItWorks: [
      "1. Captive Portal Customization (`/settings/captive-portal`): ISP admins customize business name, logo, colors, layout template, welcome text, login methods, and featured hotspot packages with live mobile/desktop preview.",
      "2. Subscriber Portal Experience (`/captive`): Hotspot users connect to Wi-Fi and are redirected by the MikroTik Hotspot Walled Garden to `/captive`.",
      "3. Instant M-Pesa Checkout or Voucher Entry: Users either enter a prepaid voucher code generated on `/vouchers` or select a package and pay via M-Pesa STK Push.",
      "4. Session Activation: Upon payment callback or valid voucher verification, FreeRADIUS/MikroTik authorizes the device MAC/IP for the package's exact duration and speed limit.",
    ],
    availableActions: [
      "Customize Captive Portal branding, templates, and packages (`/settings/captive-portal`)",
      "Preview live Captive Portal (`/captive`)",
      "Generate and export prepaid voucher batches (`/vouchers`)",
    ],
    requiredPermissions: ["org.manage", "vouchers.view", "vouchers.generate", "plans.view"],
    authoritativeDataSources: ["organizations", "plans", "voucher_batches", "hotspot_vouchers", "payments"],
    dependencies: ["MikroTik Hotspot Profile", "M-Pesa Express STK Push"],
    configurationRequirements: [
      "Configure portal branding at `/settings/captive-portal` and Hotspot plans at `/plans` or `/vouchers`.",
    ],
    keywords: [
      "captive portal",
      "where do i configure the captive portal",
      "how does the captive portal work",
      "wifi marketing",
      "hotspot voucher",
      "vouchers",
      "hotspot billing",
    ],
  },
  {
    id: "payment-reconciliation-ledger",
    featureName: "Payment Reconciliation & Double-Entry Financial Ledger",
    module: "Billing & Financial Intelligence",
    route: "/billing",
    apiEndpoints: [
      "/api/v1/payments",
      "/api/v1/payments/revenue",
      "/api/v1/ledger",
      "/api/v1/mpesa-stk-push",
      "/api/v1/mpesa-callback",
    ],
    description:
      "Automated M-Pesa STK Push & Paybill C2B payment matching, suspense handling for unmatched payments, Maker-Checker approvals, and balanced double-entry accounting.",
    whyItExists:
      "Prevents revenue leakage, duplicate transaction crediting, and unallocated mobile money transfers while maintaining an auditable Trial Balance and Accounts Receivable (AR) aging ledger.",
    howItWorks: [
      "1. Incoming Payment Ingestion (`/api/v1/mpesa-callback`): Receives M-Pesa Express or C2B Paybill callbacks with transaction reference, amount, MSISDN phone, and account reference.",
      "2. Deterministic Matching (`reconcileIncomingPayment`): Matches payments by exact account number (`GT-XXXX`) or normalized subscriber phone number against open invoices.",
      "3. Classification: Classifies each transaction as `MATCHED`, `OVERPAYMENT` (credits subscriber balance), `PARTIAL` (reduces balance due), `DUPLICATE` (idempotently ignored), or `UNMATCHED` (routed to Suspense Account `2150` for operator review on `/billing`).",
      "4. Double-Entry Posting (`/api/v1/ledger`): Posts balanced debit/credit journal entries across Cash/M-Pesa (`1010`), Accounts Receivable (`1100`), Subscription Revenue (`4000`), Hotspot Revenue (`4010`), and VAT Payable (`2200`).",
      "5. Maker-Checker Governance: Refunds or waivers above threshold require dual authorization (`approvals.request` + `approvals.decide`).",
    ],
    availableActions: [
      "View invoices, payments, and AR aging buckets (`/billing`)",
      "Reconcile unmatched/suspense M-Pesa payments (`/billing`)",
      "Trigger M-Pesa STK Push prompt (`/billing` or `/customers`)",
      "Inspect balanced double-entry journal entries and Trial Balance (`/billing`)",
      "Request or approve credit notes/waivers",
    ],
    requiredPermissions: [
      "billing.view",
      "billing.reconcile",
      "billing.refund",
      "ledger.view",
      "ledger.post",
      "approvals.request",
      "approvals.decide",
    ],
    authoritativeDataSources: ["invoices", "payments", "journal_entries", "approval_requests"],
    dependencies: ["Safaricom Daraja M-Pesa API", "Customer Account Numbers"],
    configurationRequirements: [
      "Configure organization currency, billing cycle, and M-Pesa Paybill/Till credentials in `/settings`.",
    ],
    keywords: [
      "reconcile",
      "payment reconciliation",
      "where can i reconcile a payment",
      "how does payment reconciliation work",
      "double entry ledger",
      "trial balance",
      "invoices",
      "mpesa",
    ],
  },
  {
    id: "mikrotik-noc-monitoring",
    featureName: "MikroTik Router Fleet, GPON OLT & NOC Monitoring",
    module: "Network & NOC",
    route: "/routers",
    apiEndpoints: ["/api/v1/mikrotik-fleet", "/api/v1/monitoring/noc"],
    description:
      "Centralized management and real-time health telemetry for MikroTik RouterOS BNG routers (`/routers`), GPON OLTs/ONTs, interface traffic, and NOC topology blast-radius correlation (`/monitoring`).",
    whyItExists:
      "Gives network engineers real-time visibility into router CPU/RAM/uptime, active PPPoE & Hotspot session counts, optical dBm attenuation, and outage blast radius across POP sites.",
    howItWorks: [
      "1. Router Onboarding (`/routers`): Connect MikroTik routers via WireGuard VPN tunnel or restricted RouterOS API port.",
      "2. Telemetry Polling (`/dashboard` & `/routers`): Tracks router status (`ONLINE`, `OFFLINE`, `DEGRADED`), CPU load %, free RAM, uptime, and active session counts.",
      "3. Live NOC & Topology (`/monitoring`): Streams open network alerts, interface RX/TX throughput and error counters, GPON OLT/ONT optical signal power (`rxPowerDbm`), and correlates parent-child topology nodes to identify outage blast radius.",
    ],
    availableActions: [
      "Add, view, and manage MikroTik routers (`/routers`)",
      "Inspect router CPU, RAM, uptime, and active sessions (`/dashboard` and `/routers`)",
      "Monitor open NOC alerts, interface traffic, and topology blast radius (`/monitoring`)",
    ],
    requiredPermissions: ["routers.view", "routers.manage", "routers.provision", "noc.view", "olt.manage"],
    authoritativeDataSources: ["routers", "sites", "network_alerts", "olts", "onts", "topology_nodes"],
    dependencies: ["WireGuard VPN Tunnel", "MikroTik RouterOS v7 API", "SNMP / OLT Poller"],
    configurationRequirements: [
      "Register POP site and router management IP / WireGuard public key on `/routers`.",
    ],
    keywords: [
      "connect a mikrotik router",
      "how do i connect a mikrotik router",
      "where can i view router health",
      "where can i see active sessions",
      "noc metric",
      "what does this noc metric mean",
      "router health",
      "monitoring",
    ],
  },
  {
    id: "field-operations-inventory",
    featureName: "Field Technician Work Orders, SLA Tickets & Inventory",
    module: "Field Operations & Inventory",
    route: "/technicians",
    apiEndpoints: [],
    description:
      "Dispatch and tracking for fiber installations, splice repairs, SLA support tickets, and serialized CPE/ONT warehouse inventory.",
    whyItExists:
      "Coordinates field technicians with NOC optical alarms and new subscriber installations while tracking ONTs, drop fiber, and splitters from warehouse to subscriber premises.",
    howItWorks: [
      "Work orders (`INSTALLATION`, `REPAIR`, `SITE_MAINTENANCE`) are assigned to technicians on `/technicians` with priority and scheduled dates.",
      "Automated NOC rules can raise critical field splice tickets when an ONT reports optical loss of signal (`LOS` / `<-27.0 dBm`).",
      "Inventory items and serialized assets track MAC addresses and serial numbers assigned to each subscriber.",
    ],
    availableActions: [
      "View and dispatch technician work orders (`/technicians`)",
      "Track SLA support tickets and escalations",
      "Audit warehouse stock levels and serialized ONT assignments",
    ],
    requiredPermissions: ["work_orders.view", "work_orders.update", "inventory.manage"],
    authoritativeDataSources: ["work_orders", "support_tickets", "inventory_items", "serialized_assets"],
    dependencies: ["Customer Records", "NOC Optical Alarms"],
    configurationRequirements: [
      "Assign staff profiles with the `technician` role in `/settings`.",
    ],
    keywords: [
      "work order",
      "technician",
      "field operations",
      "inventory",
      "tickets",
      "sla",
    ],
  },
  {
    id: "system-settings-security",
    featureName: "Organization Settings, RBAC & Security Audit",
    module: "Configuration & Security",
    route: "/settings",
    apiEndpoints: ["/api/v1/settings"],
    description:
      "Tenant-wide configuration for business identity, billing cycle, grace periods, M-Pesa gateway settings, Role-Based Access Control (RBAC), and SOC/audit logs.",
    whyItExists:
      "Allows ISP owners and administrators to govern tenant preferences and enforce least-privilege access across Admin, NOC, Finance, Support, and Technician roles.",
    howItWorks: [
      "Organization settings (`/settings`) configure business name, support email/phone, currency, timezone, billing cycle (`ANNIVERSARY` or `CALENDAR_MONTH`), and grace period days.",
      "Captive Portal settings (`/settings/captive-portal`) configure per-tenant hotspot branding and packages.",
      "All administrative and security events are recorded in the tenant-scoped audit trail.",
    ],
    availableActions: [
      "Update organization & billing configuration (`/settings`)",
      "Customize Captive Portal (`/settings/captive-portal`)",
      "Review RBAC permissions and security/audit events",
    ],
    requiredPermissions: ["org.manage", "users.manage", "audit.view", "soc.view"],
    authoritativeDataSources: ["organizations", "profiles", "audit_log", "security_events"],
    dependencies: ["Supabase Auth & PostgreSQL RLS"],
    configurationRequirements: ["Requires `isp_owner` or `super_admin` role for tenant-wide settings."],
    keywords: [
      "settings",
      "configuration",
      "rbac",
      "permissions",
      "grace period",
      "billing cycle",
    ],
  },
];

export function findMatchingCapabilities(query: string): FeatureCapabilityDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return SYSTEM_CAPABILITY_REGISTRY;

  const scored = SYSTEM_CAPABILITY_REGISTRY.map((cap) => {
    let score = 0;
    for (const kw of cap.keywords) {
      if (q.includes(kw)) score += 10;
    }
    if (q.includes(cap.featureName.toLowerCase())) score += 8;
    if (q.includes(cap.module.toLowerCase())) score += 5;
    if (q.includes(cap.route.toLowerCase())) score += 6;

    const tokens = q.split(/\W+/).filter((t) => t.length >= 3);
    const haystack = `${cap.featureName} ${cap.module} ${cap.description} ${cap.howItWorks.join(" ")} ${cap.availableActions.join(" ")} ${cap.keywords.join(" ")}`.toLowerCase();
    for (const t of tokens) {
      if (haystack.includes(t)) score += 1;
    }
    return { cap, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.cap);
}
