"use client";
import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Layers,
  Plus,
  Wifi,
  Zap,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Edit2,
  X,
} from "lucide-react";
import { SEED_PLANS } from "@/lib/db/mock-db";
import { ServicePlan, ServiceType } from "@/types";
import { formatKES, formatSpeed, formatDuration } from "@/lib/utils";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";

export default function PlansPage() {
  const [plans, setPlans] = useState<ServicePlan[]>(SEED_PLANS);
  const [activeTab, setActiveTab] = useState<ServiceType>("PPPOE");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("PPPOE");
  const [downMbps, setDownMbps] = useState(10);
  const [upMbps, setUpMbps] = useState(5);
  const [priceKes, setPriceKes] = useState(2500);
  const [validityDays, setValidityDays] = useState(30);

  const filteredPlans = plans.filter((p) => p.serviceType === activeTab);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const validitySec = validityDays * 86400;
    const downKbps = downMbps * 1024;
    const upKbps = upMbps * 1024;

    const newPlan: ServicePlan = {
      id: `plan-${Date.now()}`,
      organizationId: "org-gtech-kenya-01",
      name,
      serviceType,
      downloadSpeedKbps: downKbps,
      uploadSpeedKbps: upKbps,
      priority: 8,
      validityDurationSeconds: validitySec,
      dataLimitMb: 0,
      price: priceKes,
      currency: "KES",
      simultaneousSessions: 1,
      mikrotikRateLimit: `${upKbps}k/${downKbps}k`,
      isActive: true,
      subscriberCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPlans([...plans, newPlan]);
    setIsModalOpen(false);
    setName("");
  };

  return (
    <AppShell title="Service Plans & Speed Profiles">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Internet Service Plans
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure PPPoE Fiber tiers, Hotspot prepaid vouchers, bandwidth burst limits, and KSh pricing
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-brand-btn transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Service Type Switcher (WebHunt Pill Design) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface border border-border shadow-xs w-fit">
        <button
          onClick={() => setActiveTab("PPPOE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "PPPOE"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>PPPoE Fiber Plans ({plans.filter((p) => p.serviceType === "PPPOE").length})</span>
        </button>
        <button
          onClick={() => setActiveTab("HOTSPOT")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "HOTSPOT"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Hotspot Prepaid Packages ({plans.filter((p) => p.serviceType === "HOTSPOT").length})</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <GlassCard key={plan.id} className="flex flex-col justify-between" hoverEffect>
            <GlassCardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <GlassBadge variant="primary" size="sm">
                    {plan.serviceType}
                  </GlassBadge>
                  <h3 className="font-extrabold text-foreground text-base mt-2">
                    {plan.name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-foreground">
                    {formatKES(plan.price)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    / {formatDuration(plan.validityDurationSeconds)}
                  </div>
                </div>
              </div>

              {/* Bandwidth Badges */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                    <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Download</span>
                  </div>
                  <div className="text-sm font-extrabold text-foreground">
                    {formatSpeed(plan.downloadSpeedKbps)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                    <ArrowUpCircle className="w-3.5 h-3.5 text-primary" />
                    <span>Upload</span>
                  </div>
                  <div className="text-sm font-extrabold text-foreground">
                    {formatSpeed(plan.uploadSpeedKbps)}
                  </div>
                </div>
              </div>

              {/* FreeRADIUS Rate Limit String */}
              <div className="p-2.5 rounded-xl bg-surface-elevated border border-border space-y-1">
                <div className="text-[10px] text-muted-foreground font-mono">Mikrotik-Rate-Limit:</div>
                <div className="font-mono text-xs text-primary font-bold truncate">
                  {plan.mikrotikRateLimit}
                </div>
              </div>
            </GlassCardContent>

            <div className="p-4 border-t border-border bg-surface-elevated/40 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold">{plan.subscriberCount || 0} subscribers</span>
              <GlassBadge variant="success" size="sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </GlassBadge>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Create Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated/70">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-foreground text-base">New Service Plan</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Platinum Fiber - 50 Mbps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Service Type
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-primary font-semibold"
                  >
                    <option value="PPPOE">PPPoE Fiber</option>
                    <option value="HOTSPOT">Hotspot Wireless</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Price (KSh) *
                  </label>
                  <input
                    type="number"
                    required
                    value={priceKes}
                    onChange={(e) => setPriceKes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Download Speed (Mbps)
                  </label>
                  <input
                    type="number"
                    required
                    value={downMbps}
                    onChange={(e) => setDownMbps(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Upload Speed (Mbps)
                  </label>
                  <input
                    type="number"
                    required
                    value={upMbps}
                    onChange={(e) => setUpMbps(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-foreground text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-brand-btn transition"
                >
                  Save Service Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
