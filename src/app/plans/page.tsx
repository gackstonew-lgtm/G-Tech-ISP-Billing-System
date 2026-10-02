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
          <h2 className="text-xl font-bold text-white tracking-tight">
            Internet Service Plans
          </h2>
          <p className="text-xs text-slate-400">
            Configure PPPoE Fiber tiers, Hotspot prepaid vouchers, bandwidth burst limits, and KSh pricing
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-900/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Service Type Switcher */}
      <div className="flex items-center gap-3 p-1.5 rounded-xl bg-[#0e1626] border border-slate-800/80 w-fit">
        <button
          onClick={() => setActiveTab("PPPOE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === "PPPOE"
              ? "bg-sky-600 text-white shadow-md shadow-sky-900/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>PPPoE Fiber Plans ({plans.filter((p) => p.serviceType === "PPPOE").length})</span>
        </button>
        <button
          onClick={() => setActiveTab("HOTSPOT")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === "HOTSPOT"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Hotspot Prepaid Packages ({plans.filter((p) => p.serviceType === "HOTSPOT").length})</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800/80 shadow-xl space-y-5 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {plan.serviceType}
                  </span>
                  <h3 className="font-bold text-white text-base mt-2">
                    {plan.name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-white">
                    {formatKES(plan.price)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    / {formatDuration(plan.validityDurationSeconds)}
                  </div>
                </div>
              </div>

              {/* Bandwidth Badges */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                    <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {formatSpeed(plan.downloadSpeedKbps)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                    <ArrowUpCircle className="w-3.5 h-3.5 text-sky-400" />
                    <span>Upload</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {formatSpeed(plan.uploadSpeedKbps)}
                  </div>
                </div>
              </div>

              {/* FreeRADIUS Rate Limit String */}
              <div className="mt-4 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-400 font-mono">Mikrotik-Rate-Limit:</div>
                <div className="font-mono text-xs text-sky-400 truncate">
                  {plan.mikrotikRateLimit}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{plan.subscriberCount || 0} active subscribers</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">New Service Plan</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Platinum Fiber - 50 Mbps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Service Type
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="PPPOE">PPPoE Fiber</option>
                    <option value="HOTSPOT">Hotspot Wireless</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Price (KSh) *
                  </label>
                  <input
                    type="number"
                    required
                    value={priceKes}
                    onChange={(e) => setPriceKes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Download Speed (Mbps)
                  </label>
                  <input
                    type="number"
                    required
                    value={downMbps}
                    onChange={(e) => setDownMbps(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Upload Speed (Mbps)
                  </label>
                  <input
                    type="number"
                    required
                    value={upMbps}
                    onChange={(e) => setUpMbps(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-900/30 transition"
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
