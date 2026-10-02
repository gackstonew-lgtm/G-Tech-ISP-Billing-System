"use client";
import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Key,
  Wifi,
  ExternalLink,
  Shield,
  Phone,
  Mail,
  MapPin,
  X,
} from "lucide-react";
import {
  SEED_CUSTOMERS,
  SEED_PPPOE,
  SEED_PLANS,
  SEED_SITES,
} from "@/lib/db/mock-db";
import { Customer, CustomerStatus } from "@/types";
import { formatKES, formatShortDate } from "@/lib/utils";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(SEED_PLANS[1].id);
  const [selectedSiteId, setSelectedSiteId] = useState(SEED_SITES[0].id);

  // Filtered subscribers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm);
    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleSuspend = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newStatus: CustomerStatus =
            c.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) return;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      organizationId: "org-gtech-kenya-01",
      accountNumber: `GT-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      phoneNumber,
      email,
      physicalAddress,
      siteId: selectedSiteId,
      siteName: SEED_SITES.find((s) => s.id === selectedSiteId)?.name,
      status: "ACTIVE",
      balanceDue: 0,
      createdAt: new Date().toISOString(),
    };

    setCustomers([newCustomer, ...customers]);
    setIsAddModalOpen(false);
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setPhysicalAddress("");
  };

  return (
    <AppShell title="Subscribers & Customer CRM">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Subscriber Directory
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage PPPoE and Hotspot subscriber accounts, speed profiles, and active connectivity states
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-brand-btn transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscriber</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, account #, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "SUSPENDED", "PENDING_INSTALLATION"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface-elevated text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="border-b border-border text-[11px] uppercase text-muted-foreground font-bold bg-surface-elevated/50">
              <tr>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Account No</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">POP / Site</th>
                <th className="py-3 px-4">PPPoE Credential</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((cust) => {
                const pppoe = SEED_PPPOE.find((p) => p.customerId === cust.id);
                return (
                  <tr key={cust.id} className="hover:bg-surface-elevated/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground">
                        {cust.fullName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {cust.physicalAddress}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {cust.accountNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-foreground font-semibold">{cust.phoneNumber}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                        {cust.email || "No email"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-foreground">{cust.siteName || "CBD Tower"}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {pppoe ? (
                        <div className="space-y-0.5">
                          <div className="text-primary font-bold">{pppoe.username}</div>
                          <div className="text-muted-foreground text-[10px]">
                            IP: {pppoe.currentIp || "Dynamic Pool"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Not Provisioned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <GlassBadge
                        variant={
                          cust.status === "ACTIVE"
                            ? "success"
                            : cust.status === "SUSPENDED"
                            ? "destructive"
                            : "warning"
                        }
                        size="sm"
                      >
                        {cust.status === "ACTIVE" && <CheckCircle2 className="w-3 h-3" />}
                        {cust.status === "SUSPENDED" && <PauseCircle className="w-3 h-3" />}
                        <span>{cust.status.replace("_", " ")}</span>
                      </GlassBadge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleSuspend(cust.id)}
                          title={cust.status === "ACTIVE" ? "Suspend and CoA Disconnect" : "Activate"}
                          className={`p-1.5 rounded-xl border transition ${
                            cust.status === "ACTIVE"
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {cust.status === "ACTIVE" ? (
                            <PauseCircle className="w-4 h-4" />
                          ) : (
                            <PlayCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated/70">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-foreground text-base">New Subscriber Provisioning</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dennis Kipchumba"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Phone (M-Pesa) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="client@isp.co.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Physical Installation Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kilimani, Wood Avenue Apt 3B"
                  value={physicalAddress}
                  onChange={(e) => setPhysicalAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Service Plan
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {SEED_PLANS.filter((p) => p.serviceType === "PPPOE").map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} ({formatKES(plan.price)}/mo)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    POP / Site
                  </label>
                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {SEED_SITES.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-foreground text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-brand-btn transition"
                >
                  Provision Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
