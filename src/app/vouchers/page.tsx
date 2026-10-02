"use client";
import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Ticket,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Wifi,
  Radio,
  QrCode,
  X,
} from "lucide-react";
import {
  SEED_HOTSPOT_VOUCHERS,
  SEED_VOUCHER_BATCHES,
  SEED_PLANS,
  SEED_ORGANIZATION,
} from "@/lib/db/mock-db";
import { HotspotVoucher, VoucherBatch } from "@/types";
import { VoucherGenerator } from "@/lib/vouchers/generator";
import { formatKES, formatShortDate } from "@/lib/utils";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<HotspotVoucher[]>(SEED_HOTSPOT_VOUCHERS);
  const [batches, setBatches] = useState<VoucherBatch[]>(SEED_VOUCHER_BATCHES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const hotspotPlans = SEED_PLANS.filter((p) => p.serviceType === "HOTSPOT");
  const [selectedPlanId, setSelectedPlanId] = useState(hotspotPlans[0]?.id || "");
  const [quantity, setQuantity] = useState(20);
  const [prefix, setPrefix] = useState("GT");

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = hotspotPlans.find((p) => p.id === selectedPlanId);
    if (!plan) return;

    const newBatchId = `batch-${Date.now()}`;
    const newBatch: VoucherBatch = {
      id: newBatchId,
      organizationId: SEED_ORGANIZATION.id,
      planId: plan.id,
      planName: `${plan.name} (${formatKES(plan.price)})`,
      batchName: `${plan.name} - ${quantity}x Batch`,
      quantity,
      prefix,
      generatedByName: "Baraka Gackstone",
      createdAt: new Date().toISOString(),
    };

    const newVouchers = VoucherGenerator.generateVoucherBatch({
      organizationId: SEED_ORGANIZATION.id,
      batchId: newBatchId,
      plan,
      quantity,
      prefix,
    });

    setBatches([newBatch, ...batches]);
    setVouchers([...newVouchers, ...vouchers]);
    setIsGenerateModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell title="Hotspot Vouchers & Batch Printing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Hotspot Voucher Engine
          </h2>
          <p className="text-xs text-slate-400">
            Generate cryptographically unique access tokens, format thermal receipts, and print A4 cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Cards / Thermal</span>
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-900/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Batch</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-[#0e1626] border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search voucher code (e.g. GT1H)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["ALL", "AVAILABLE", "USED", "EXPIRED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === status
                  ? "bg-sky-600 text-white font-semibold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="rounded-xl bg-[#0e1626] border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold bg-slate-900/50">
              <tr>
                <th className="py-3 px-4">Voucher Code</th>
                <th className="py-3 px-4">Plan / Duration</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Usage Details</th>
                <th className="py-3 px-4">Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredVouchers.map((v) => (
                <tr key={v.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-sky-400 tracking-wider bg-sky-950/40 px-2 py-1 rounded border border-sky-800/40">
                      {v.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-200">
                    <div className="font-semibold">{v.planName}</div>
                    <div className="text-[10px] text-slate-400">{v.planDuration}</div>
                  </td>
                  <td className="py-3 px-4 font-sans font-bold text-emerald-400">
                    {formatKES(v.planPrice || 10)}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        v.status === "AVAILABLE"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : v.status === "USED"
                          ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {v.status === "AVAILABLE" && <CheckCircle2 className="w-3 h-3" />}
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 font-sans">
                    {v.usedByPhone ? (
                      <div>
                        <span>Used by {v.usedByPhone}</span>
                        <div className="text-[10px] text-slate-500 font-mono">{v.usedMacAddress}</div>
                      </div>
                    ) : (
                      <span className="italic text-slate-500">Unused</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400">
                    {formatShortDate(v.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Batch Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Generate Voucher Batch</h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Hotspot Package *
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {hotspotPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({formatKES(plan.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Quantity *
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value={10}>10 Vouchers</option>
                    <option value={25}>25 Vouchers</option>
                    <option value={50}>50 Vouchers</option>
                    <option value={100}>100 Vouchers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-900/30 transition"
                >
                  Generate {quantity} Tokens
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  Voucher Print Sheet (A4 & POS Thermal Preview)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Now</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-400 hover:text-white ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-slate-950">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {vouchers.slice(0, 12).map((v) => (
                  <div
                    key={v.id}
                    className="voucher-card p-3.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 text-slate-100 flex flex-col justify-between space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[11px] font-bold tracking-tight">G-TECH WIFI</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">
                        {formatKES(v.planPrice || 10)}
                      </span>
                    </div>

                    <div className="text-center py-1">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Voucher Code
                      </div>
                      <div className="font-mono text-sm font-extrabold text-white tracking-wider mt-0.5">
                        {v.code}
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-1 text-[9px] text-slate-400 text-center leading-tight">
                      <div>Plan: {v.planName}</div>
                      <div>Connect: <span className="font-bold text-slate-300">G-Tech_FreeWiFi</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
