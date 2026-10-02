"use client";

import React, { useEffect, useState } from "react";
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
  Phone,
  Mail,
  MapPin,
  X,
  Sparkles,
} from "lucide-react";
import {
  SEED_CUSTOMERS,
  SEED_PLANS,
  SEED_SITES,
} from "@/lib/db/mock-db";
import { Customer } from "@/types";
import { formatKES, formatShortDate } from "@/lib/utils";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { useAuth } from "@/lib/auth/auth-context";

export default function CustomersPage() {
  const { isDemoMode, user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(SEED_PLANS[1].id);
  const [selectedSiteId, setSelectedSiteId] = useState(SEED_SITES[0].id);

  const fetchCustomers = async () => {
    if (isDemoMode) {
      setCustomers(SEED_CUSTOMERS);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/customers");
      const data = await res.json();
      if (data?.success && data.data) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error("[Customers] Failed to fetch real customer data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [isDemoMode, user?.id]);

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
          const newStatus = c.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        organizationId: "org-gtech-kenya-01",
        accountNumber: `GT-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName,
        phoneNumber,
        email,
        physicalAddress,
        siteId: selectedSiteId,
        status: "ACTIVE",
        balanceDue: 0,
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      setIsAddModalOpen(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          email,
          physicalAddress,
          siteId: selectedSiteId,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCustomers((prev) => [data.data, ...prev]);
        setIsAddModalOpen(false);
        setFullName("");
        setPhoneNumber("");
        setEmail("");
        setPhysicalAddress("");
      }
    } catch (err) {
      console.error("[Customers] Failed to create subscriber:", err);
    }
  };

  return (
    <AppShell title="Subscribers & Subscriber Care">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Subscriber Directory
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage PPPoE &amp; Hotspot subscribers, RADIUS profiles, and instant disconnection
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-brand-btn transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Subscriber</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subscriber by name, phone, or account number (e.g. GT-8921)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-surface-elevated border border-border text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_INSTALLATION">Pending Installation</option>
          </select>
        </div>
      </div>

      {/* Customers List / Table */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              Registered Subscribers ({filteredCustomers.length})
            </h3>
          </div>
          {isDemoMode && (
            <GlassBadge variant="warning" size="sm">
              <Sparkles className="w-3 h-3" />
              <span>Demo Dataset</span>
            </GlassBadge>
          )}
        </GlassCardHeader>

        <div className="overflow-x-auto">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-surface-elevated/30">
              <Users className="w-8 h-8 text-muted-foreground mx-auto" />
              <div className="text-xs font-bold text-foreground">No Subscribers Found</div>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                {searchTerm || statusFilter !== "ALL"
                  ? "No subscriber records match your current search criteria."
                  : "You have not provisioned any subscribers yet. Click 'Provision Subscriber' to add your first customer."}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-brand-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Provision First Subscriber</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-foreground">
              <thead className="border-b border-border text-[11px] uppercase text-muted-foreground font-bold bg-surface-elevated/50">
                <tr>
                  <th className="py-3 px-4">Account &amp; Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Site / POP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-surface-elevated/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <span>{cust.fullName}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-primary font-bold">
                          {cust.accountNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        Created: {formatShortDate(cust.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5 font-mono">
                      <div className="flex items-center gap-1.5 text-foreground font-semibold">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span>{cust.phoneNumber}</span>
                      </div>
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                          <Mail className="w-3 h-3" />
                          <span>{cust.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground font-mono">
                      <div className="flex items-center gap-1 text-foreground">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>{cust.siteName || "Nairobi CBD Tower"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <GlassBadge
                        variant={cust.status === "ACTIVE" ? "success" : "warning"}
                        size="sm"
                      >
                        {cust.status === "ACTIVE" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>{cust.status}</span>
                      </GlassBadge>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      {cust.balanceDue > 0 ? (
                        <span className="text-rose-500">{formatKES(cust.balanceDue)}</span>
                      ) : (
                        <span className="text-emerald-500">KSh 0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleSuspend(cust.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          cust.status === "ACTIVE"
                            ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
                        }`}
                      >
                        {cust.status === "ACTIVE" ? (
                          <>
                            <PauseCircle className="w-3 h-3" />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3 h-3" />
                            <span>Reactivate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {/* Provision Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Provision Subscriber</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-elevated text-foreground flex items-center justify-center hover:bg-surface border border-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Kamau Mwangi"
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1 uppercase">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0799112233"
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1 uppercase">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.kamau@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1 uppercase">Physical Address</label>
                <input
                  type="text"
                  value={physicalAddress}
                  onChange={(e) => setPhysicalAddress(e.target.value)}
                  placeholder="Kilimani, Menelik Road Apt 4B"
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated border border-border text-xs font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-brand-btn"
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
