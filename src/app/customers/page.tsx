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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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
          <h2 className="text-xl font-bold text-white tracking-tight">
            Subscriber Directory
          </h2>
          <p className="text-xs text-slate-400">
            Manage PPPoE and Hotspot subscriber accounts, speed profiles, and active connectivity states
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-900/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscriber</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-[#0e1626] border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, account #, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "SUSPENDED", "PENDING_INSTALLATION"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                statusFilter === status
                  ? "bg-sky-600 text-white font-semibold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="rounded-xl bg-[#0e1626] border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold bg-slate-900/50">
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
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map((cust) => {
                const pppoe = SEED_PPPOE.find((p) => p.customerId === cust.id);
                return (
                  <tr key={cust.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        {cust.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cust.physicalAddress}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-sky-400">
                      {cust.accountNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-200">{cust.phoneNumber}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {cust.email || "No email"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300">{cust.siteName || "CBD Tower"}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {pppoe ? (
                        <div className="space-y-0.5">
                          <div className="text-sky-400 font-semibold">{pppoe.username}</div>
                          <div className="text-slate-400 text-[10px]">
                            IP: {pppoe.currentIp || "Dynamic Pool"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Provisioned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          cust.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : cust.status === "SUSPENDED"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {cust.status === "ACTIVE" && <CheckCircle2 className="w-3 h-3" />}
                        {cust.status === "SUSPENDED" && <PauseCircle className="w-3 h-3" />}
                        {cust.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleSuspend(cust.id)}
                          title={cust.status === "ACTIVE" ? "Suspend and CoA Disconnect" : "Activate"}
                          className={`p-1.5 rounded-lg border transition ${
                            cust.status === "ACTIVE"
                              ? "bg-rose-950/40 text-rose-400 border-rose-800 hover:bg-rose-900/60"
                              : "bg-emerald-950/40 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60"
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
      </div>

      {/* Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">New Subscriber Provisioning</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dennis Kipchumba"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phone (M-Pesa) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="client@isp.co.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Physical Installation Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kilimani, Wood Avenue Apt 3B"
                  value={physicalAddress}
                  onChange={(e) => setPhysicalAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Service Plan
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    {SEED_PLANS.filter((p) => p.serviceType === "PPPOE").map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} ({formatKES(plan.price)}/mo)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    POP / Site
                  </label>
                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    {SEED_SITES.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-500/20 text-xs text-sky-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>FreeRADIUS & MikroTik Auto-Provisioning</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Saving will generate RADIUS <code className="text-sky-400">radcheck</code> credentials and MikroTik rate-limiting profiles immediately.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-900/30 transition"
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
