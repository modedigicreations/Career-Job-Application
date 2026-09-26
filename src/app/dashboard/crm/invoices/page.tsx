'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  CreditCard,
  Printer,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Invoice, Payment, Currency } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoicesPage() {
  const { invoices, recordPayment, addInvoice } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Record Payment Form State
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<Payment['method']>('bank-transfer');
  const [payRef, setPayRef] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (searchTerm && !inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) && !inv.clientName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalCollected = invoices.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const outstandingBalance = totalBilled - totalCollected;

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !payAmount) return;

    recordPayment(
      selectedInvoiceForPayment.id,
      parseFloat(payAmount) || 0,
      payMethod,
      payRef || `REF-${Date.now()}`
    );

    setSelectedInvoiceForPayment(null);
    setPayAmount('');
    setPayRef('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Client Invoices & Receivables
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Multi-Currency (NGN, GBP, USD)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated invoice numbering, payment milestones, and receipts generation.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Invoiced</span>
          <div className="mt-1.5 text-xl font-black text-slate-900">
            {formatCurrency(totalBilled, 'NGN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{invoices.length} invoices generated</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Collected</span>
          <div className="mt-1.5 text-xl font-black text-emerald-600">
            {formatCurrency(totalCollected, 'NGN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Confirmed revenue received</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Outstanding Receivables</span>
          <div className="mt-1.5 text-xl font-black text-amber-600">
            {formatCurrency(outstandingBalance, 'NGN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Due for follow-up</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'paid', 'sent', 'partially-paid', 'draft'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filterStatus === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice # or client..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(inv => {
                const bal = inv.total - inv.amountPaid;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inv.clientName}</div>
                      <div className="text-[10px] text-slate-400">{inv.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      {formatCurrency(inv.amountPaid, inv.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {formatCurrency(bal, inv.currency)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : inv.status === 'partially-paid'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {inv.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceForPayment(inv);
                              setPayAmount(bal > 0 ? `${bal}` : `${inv.total}`);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                          >
                            Record Pay
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Printer size={12} />
                          <span>View</span>
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

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedInvoiceForPayment(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Record Client Payment</h2>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl my-3 space-y-1">
              <span className="font-bold text-slate-900">{selectedInvoiceForPayment.clientName}</span>
              <div className="flex justify-between text-slate-600">
                <span>Invoice: {selectedInvoiceForPayment.invoiceNumber}</span>
                <span className="font-bold text-slate-900">
                  Total: {formatCurrency(selectedInvoiceForPayment.total, selectedInvoiceForPayment.currency)}
                </span>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Amount *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="bank-transfer">Direct Bank Transfer</option>
                  <option value="paystack">Paystack</option>
                  <option value="flutterwave">Flutterwave</option>
                  <option value="stripe">Stripe</option>
                  <option value="cash">Cash / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transaction Reference</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  placeholder="e.g. TRF-MODE-8820"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable View Modal */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedInvoiceForPrint(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 z-10 text-slate-800">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0D52F8] text-white flex items-center justify-center font-bold">M</div>
                  <span className="text-lg font-black tracking-tight text-slate-900">MODE DIGITAL CREATIONS</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Technology, Cloud & Educational Platforms</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-black text-blue-600">{selectedInvoiceForPrint.invoiceNumber}</div>
                <div className="text-[10px] text-slate-400">Issue: {formatDate(selectedInvoiceForPrint.issueDate)}</div>
                <div className="text-[10px] text-rose-500 font-semibold">Due: {formatDate(selectedInvoiceForPrint.dueDate)}</div>
              </div>
            </div>

            <div className="my-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Billed To</span>
                <div className="font-bold text-slate-900 mt-0.5">{selectedInvoiceForPrint.clientName}</div>
                <div className="text-slate-500">{selectedInvoiceForPrint.clientEmail}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                <div className="mt-0.5 font-bold capitalize text-blue-600">{selectedInvoiceForPrint.status}</div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-500 pb-1 border-b border-slate-200">
                <span>Description</span>
                <span>Total</span>
              </div>
              {selectedInvoiceForPrint.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                  <span>{item.description} (x{item.quantity})</span>
                  <span className="font-semibold">{formatCurrency(item.total, selectedInvoiceForPrint.currency)}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-blue-600">{formatCurrency(selectedInvoiceForPrint.total, selectedInvoiceForPrint.currency)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-6 border-t border-slate-200 mt-6">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print Official Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
