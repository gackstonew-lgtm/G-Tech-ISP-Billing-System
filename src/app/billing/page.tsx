"use client";
import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  X,
} from "lucide-react";
import {
  SEED_PAYMENTS,
  SEED_CUSTOMERS,
  SEED_ORGANIZATION,
} from "@/lib/db/mock-db";
import { Payment } from "@/types";
import { MpesaService } from "@/lib/payments/mpesa";
import { formatKES, formatShortDate } from "@/lib/utils";

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>(SEED_PAYMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStkModalOpen, setIsStkModalOpen] = useState(false);

  // STK Form State
  const [phone, setPhone] = useState("0799112233");
  const [amount, setAmount] = useState(2500);
  const [accRef, setAccRef] = useState("GT-8921");
  const [stkStatus, setStkStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const filteredPayments = payments.filter((p) => {
    return (
      p.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.msisdnPhone.includes(searchTerm) ||
      (p.senderName && p.senderName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const totalCollected = payments.reduce((acc, p) => acc + (p.status === "COMPLETED" ? p.amount : 0), 0);

  const handleSendSTK = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStkStatus(null);

    const res = await MpesaService.initiateSTKPush({
      phoneNumber: phone,
      amount,
      accountReference: accRef,
      transactionDesc: `Internet Subscription ${accRef}`,
    });

    setIsSending(false);
    if (res.success) {
      setStkStatus("STK Prompt sent! Simulating instant customer PIN entry...");

      // Simulate webhook delivery after 1.5 seconds
      setTimeout(() => {
        const receipt = MpesaService.generateReceiptNumber();
        const newPayment: Payment = {
          id: `pay-${Date.now()}`,
          organizationId: SEED_ORGANIZATION.id,
          accountNumber: accRef,
          customerName: "John Kamau Mwangi",
          paymentMethod: "MPESA_EXPRESS",
          amount,
          currency: "KES",
          transactionReference: receipt,
          msisdnPhone: MpesaService.formatPhoneNumber(phone),
          senderName: "JOHN KAMAU",
          status: "COMPLETED",
          processedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        setPayments([newPayment, ...payments]);
        setStkStatus(`Payment Confirmed! Receipt: ${receipt}. FreeRADIUS account unblocked.`);
        setTimeout(() => {
          setIsStkModalOpen(false);
          setStkStatus(null);
        }, 2200);
      }, 1500);
    }
  };

  return (
    <AppShell title="Billing, Invoicing & M-Pesa Ledgers">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Financial & Payment Gateway Operations
          </h2>
          <p className="text-xs text-slate-400">
            Safaricom Daraja STK Push, C2B Paybill ledger reconciliation, and automated subscriber unblocking
          </p>
        </div>
        <button
          onClick={() => setIsStkModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition"
        >
          <Zap className="w-4 h-4" />
          <span>Trigger M-Pesa STK Push</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 shadow-lg">
          <div className="text-xs font-medium uppercase text-slate-400 tracking-wider">
            Total Reconciled Collections
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {formatKES(totalCollected)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Daraja Hash Verified</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 shadow-lg">
          <div className="text-xs font-medium uppercase text-slate-400 tracking-wider">
            Active Paybill / Till Number
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            174379
          </div>
          <div className="text-xs text-sky-400 mt-1">
            G-Tech Networks C2B Validation Active
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1626] border border-slate-800/80 shadow-lg">
          <div className="text-xs font-medium uppercase text-slate-400 tracking-wider">
            Average Renewal Speed
          </div>
          <div className="text-2xl font-bold text-cyan-400 mt-2">
            1.8 seconds
          </div>
          <div className="text-xs text-slate-400 mt-1">
            M-Pesa IPN &rarr; RADIUS CoA Disconnect
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#0e1626] border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt (e.g. RKF...), phone, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-slate-200">{filteredPayments.length}</span> transactions
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl bg-[#0e1626] border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold bg-slate-900/50">
              <tr>
                <th className="py-3 px-4">Receipt Number</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Sender Phone</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Processed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">
                    {pay.transactionReference}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">
                      {pay.customerName || pay.senderName || "Hotspot Guest"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {pay.accountNumber || "Direct C2B"}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {pay.msisdnPhone}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      {pay.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400">
                    {formatKES(pay.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {pay.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {formatShortDate(pay.processedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* M-Pesa STK Push Modal */}
      {isStkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Daraja M-Pesa STK Push</h3>
              </div>
              <button
                onClick={() => setIsStkModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSTK} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Subscriber Account Reference *
                </label>
                <input
                  type="text"
                  required
                  value={accRef}
                  onChange={(e) => setAccRef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  M-Pesa Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                />
              </div>

              {stkStatus && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{stkStatus}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStkModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "Sending Prompt..." : "Send STK Push Prompt"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
