"use client";
import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  Radio,
  X,
} from "lucide-react";
import { SEED_WORK_ORDERS, SEED_USERS } from "@/lib/db/mock-db";
import { WorkOrder, WorkOrderStatus } from "@/types";
import { formatShortDate } from "@/lib/utils";

export default function TechniciansPage() {
  const [orders, setOrders] = useState<WorkOrder[]>(SEED_WORK_ORDERS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [description, setDescription] = useState("");
  const [orderType, setOrderType] = useState<"INSTALLATION" | "REPAIR">("INSTALLATION");
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "CRITICAL">("NORMAL");

  const handleUpdateStatus = (id: string, newStatus: WorkOrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: WorkOrder = {
      id: `wo-${Date.now()}`,
      organizationId: "org-gtech-kenya-01",
      ticketNumber: `WO-2025-00${orders.length + 1}`,
      customerName,
      customerPhone,
      customerAddress,
      assignedTechnicianId: "user-tech-01",
      assignedTechnicianName: "Brian Kiprop",
      title,
      description,
      orderType,
      priority,
      status: "ASSIGNED",
      scheduledDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    setOrders([newOrder, ...orders]);
    setIsModalOpen(false);
    setTitle("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setDescription("");
  };

  return (
    <AppShell title="Technician & Field Work Orders">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Field Operations & Work Orders
          </h2>
          <p className="text-xs text-slate-400">
            Dispatch technicians, manage optical power levels, drop fiber splicing, and ONU installations
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-900/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-6 rounded-2xl bg-[#0e1626] border border-slate-800/80 shadow-xl space-y-4 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                    {order.ticketNumber}
                  </span>
                  <h3 className="font-bold text-white text-base mt-2">
                    {order.title}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    order.priority === "CRITICAL"
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      : order.priority === "HIGH"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {order.priority}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                {order.description}
              </p>

              {/* Customer and Location Info */}
              <div className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-200">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300">{order.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">{order.customerAddress}</span>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Tech: <span className="font-semibold text-sky-400">{order.assignedTechnicianName}</span>
              </div>
              <div className="flex items-center gap-2">
                {order.status !== "COMPLETED" ? (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Done</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Work Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">New Field Work Order</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Ticket Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fiber Line Cut / ONU Replacement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Customer Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0712345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
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
                  required
                  placeholder="e.g. Parklands, 3rd Parklands Ave, House 14"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Technical Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Optical power threshold, ONU serial numbers, drop cable route..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
                />
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
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
