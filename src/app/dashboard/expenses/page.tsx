'use client';

import React, { useState } from 'react';
import {
  WalletCards,
  Plus,
  CheckCircle2,
  XCircle,
  Printer,
  Clock,
  CreditCard,
  Filter,
  DollarSign,
  AlertCircle,
  FileText,
  User,
  Check,
  Building,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Requisition, RequisitionUrgency, RequisitionStatus, Currency } from '@/lib/types';
import { formatCurrency, formatDate, getUrgencyBadge, getRequisitionStatusBadge } from '@/lib/utils';

export default function ExpensesPage() {
  const {
    requisitions,
    createRequisition,
    updateRequisitionDecision,
    disburseRequisition,
    currentUser
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Completed'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [newReqModalOpen, setNewReqModalOpen] = useState(false);
  const [receiptModalReq, setReceiptModalReq] = useState<Requisition | null>(null);
  const [decisionModalReq, setDecisionModalReq] = useState<Requisition | null>(null);
  const [disburseModalReq, setDisburseModalReq] = useState<Requisition | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [category, setCategory] = useState('Cloud Infrastructure');
  const [urgency, setUrgency] = useState<RequisitionUrgency>('Medium');

  // Decision State
  const [decisionNotes, setDecisionNotes] = useState('');

  // Disburse State
  const [txnId, setTxnId] = useState('');

  const categories = [
    'Cloud Infrastructure',
    'Office Utilities',
    'Marketing & Ads',
    'Equipment & Hardware',
    'Software & Tools',
    'Staff Welfare & Logistics',
    'Client Hosting Provisioning',
    'Other'
  ];

  const filteredRequisitions = requisitions.filter(r => {
    if (activeTab !== 'All' && r.status !== activeTab) return false;
    if (filterCategory !== 'All' && r.category !== filterCategory) return false;
    return true;
  });

  const totalSpent = requisitions
    .filter(r => r.status === 'Completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPending = requisitions
    .filter(r => r.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmitRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    createRequisition({
      title,
      description,
      amount: parseFloat(amount) || 0,
      currency,
      category,
      urgency,
    });

    setTitle('');
    setDescription('');
    setAmount('');
    setNewReqModalOpen(false);
  };

  const handleDecision = (status: 'Approved' | 'Rejected') => {
    if (!decisionModalReq) return;
    updateRequisitionDecision(decisionModalReq.id, status, decisionNotes || `Decision marked as ${status}`);
    setDecisionModalReq(null);
    setDecisionNotes('');
  };

  const handleDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseModalReq || !txnId) return;
    disburseRequisition(disburseModalReq.id, txnId);
    setDisburseModalReq(null);
    setTxnId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Office Expense Requisitions
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Multi-Tier Vetting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Staff purchase requests, Executive approval hierarchy, and Accounts disbursement receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewReqModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#0D52F8] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Requisition</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Disbursed Expenses (YTD)</span>
          <div className="mt-1.5 text-xl font-black text-slate-900">
            {formatCurrency(totalSpent, 'NGN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {requisitions.filter(r => r.status === 'Completed').length} Completed Receipts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
          <div className="mt-1.5 text-xl font-black text-amber-600">
            {formatCurrency(totalPending, 'NGN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {requisitions.filter(r => r.status === 'Pending').length} requests awaiting MD/Manager review
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Approved for Payment</span>
          <div className="mt-1.5 text-xl font-black text-blue-600">
            {requisitions.filter(r => r.status === 'Approved').length} Requests
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ready for Accounts disbursement
          </div>
        </div>
      </div>

      {/* Filter and Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Pending', 'Approved', 'Completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requisitions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Staff</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No requisitions found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredRequisitions.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {req.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 leading-snug">{req.title}</div>
                      {req.description && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{req.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium">{req.staffName}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(req.createdAt)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {req.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyBadge(req.urgency)}`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                      {formatCurrency(req.amount, req.currency)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRequisitionStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* If Pending: Review / Decision */}
                        {req.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => setDecisionModalReq(req)}
                            className="px-2.5 py-1 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                          >
                            Review
                          </button>
                        )}

                        {/* If Approved: Disburse */}
                        {req.status === 'Approved' && (
                          <button
                            type="button"
                            onClick={() => setDisburseModalReq(req)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                          >
                            Disburse
                          </button>
                        )}

                        {/* Printable Receipt for Completed */}
                        {req.status === 'Completed' && (
                          <button
                            type="button"
                            onClick={() => setReceiptModalReq(req)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Printer size={12} />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Requisition Modal */}
      {newReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setNewReqModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
            <h2 className="text-base font-bold text-slate-900 mb-1">Submit Purchase Requisition</h2>
            <p className="text-xs text-slate-500 mb-4">Request approval for software, hosting, equipment, or marketing spend.</p>

            <form onSubmit={handleSubmitRequisition} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Item / Expense Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. AWS Cloud Cluster Monthly Renewal"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Amount Required *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="150000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as RequisitionUrgency)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Production Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Justification / Notes</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain why this expense is needed..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewReqModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decision Modal (MD/Manager Review) */}
      {decisionModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDecisionModalReq(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
            <h2 className="text-base font-bold text-slate-900 mb-1">Executive Decision Review</h2>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 my-3 text-xs space-y-1">
              <div className="font-bold text-slate-900">{decisionModalReq.title}</div>
              <div className="text-slate-500">Requested by: {decisionModalReq.staffName}</div>
              <div className="text-base font-extrabold text-[#0D52F8]">
                {formatCurrency(decisionModalReq.amount, decisionModalReq.currency)}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Decision Comments / Conditions</label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={e => setDecisionNotes(e.target.value)}
                  placeholder="Add approval instructions or rejection reason..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDecision('Rejected')}
                  className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold transition"
                >
                  Reject Requisition
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('Approved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition shadow-xs flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Approve Requisition</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disburse Modal (Accounts) */}
      {disburseModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDisburseModalReq(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
            <h2 className="text-base font-bold text-slate-900 mb-1">Accounts Disbursement</h2>
            <p className="text-xs text-slate-500 mb-3">Record bank or card payment reference to generate official receipt.</p>

            <form onSubmit={handleDisburse} className="space-y-3.5 text-xs">
              <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl">
                <span className="text-[11px] font-semibold text-emerald-800">Approved Amount to Pay:</span>
                <div className="text-lg font-black text-emerald-700">
                  {formatCurrency(disburseModalReq.amount, disburseModalReq.currency)}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bank Reference / Transaction ID *</label>
                <input
                  type="text"
                  required
                  value={txnId}
                  onChange={e => setTxnId(e.target.value)}
                  placeholder="e.g. TXN-GTB-992014 or TRF-10294"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDisburseModalReq(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                >
                  Confirm & Disburse Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formal Printable Receipt Modal */}
      {receiptModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setReceiptModalReq(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 z-10 text-slate-800">
            {/* Printable Area */}
            <div id="print-receipt" className="space-y-6">
              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#0D52F8] text-white flex items-center justify-center font-bold">M</div>
                    <span className="text-lg font-black tracking-tight text-slate-900">MODE DIGITAL CREATIONS</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Enterprise Operations Suite • Internal Payment Voucher</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-blue-600">{receiptModalReq.receiptNumber}</div>
                  <div className="text-[10px] text-slate-400">{formatDate(receiptModalReq.completedAt || receiptModalReq.createdAt)}</div>
                </div>
              </div>

              {/* Voucher Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Paid To (Staff)</span>
                  <div className="font-bold text-slate-900 mt-0.5">{receiptModalReq.staffName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{receiptModalReq.category}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Approved By</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{receiptModalReq.decidedBy || 'Managing Director'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Transaction ID</span>
                  <div className="font-mono text-slate-700 mt-0.5">{receiptModalReq.transactionId || 'CASH / WIRE'}</div>
                </div>
              </div>

              {/* Item Breakdown Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                  <span>{receiptModalReq.title}</span>
                  <span className="text-blue-600">{formatCurrency(receiptModalReq.amount, receiptModalReq.currency)}</span>
                </div>
                {receiptModalReq.description && (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">{receiptModalReq.description}</p>
                )}
              </div>

              {/* Stamp & Seal */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <ShieldCheck size={16} />
                  <span>Verified & Disbursed By Accounts</span>
                </div>
                <div className="font-mono text-[10px]">AUTHORIZED SIGNATURE</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-6 border-t border-slate-200 mt-6">
              <button
                type="button"
                onClick={() => setReceiptModalReq(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Printer size={14} />
                <span>Print Official Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
