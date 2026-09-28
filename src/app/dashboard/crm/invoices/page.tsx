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
  ShieldCheck,
  Trash2,
  X,
  FileText
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Invoice, Payment, Currency, InvoiceItem } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoicesPage() {
  const { invoices, contacts, leads, recordPayment, addInvoice } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Create Invoice Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState<Invoice['status']>('sent');
  const [notes, setNotes] = useState('Payment due within 14 days to MODE DIGITAL CREATIONS bank account.');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [initialAmountPaid, setInitialAmountPaid] = useState<number>(0);
  const [items, setItems] = useState<{ id: string; description: string; quantity: number; unitPrice: number; total: number }[]>([
    { id: 'item-1', description: 'Web Application Development & UI Design', quantity: 1, unitPrice: 750000, total: 750000 }
  ]);

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

  const handleOpenCreateModal = () => {
    const nextNum = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    setInvoiceNumber(nextNum);
    setClientName('');
    setClientEmail('');
    setCurrency('NGN');
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setIssueDate(today);
    setDueDate(due);
    setInvoiceStatus('sent');
    setTaxRate(0);
    setInitialAmountPaid(0);
    setNotes('Payment due within 14 days to MODE DIGITAL CREATIONS bank account.');
    setItems([
      { id: `item-${Date.now()}-1`, description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
    setIsCreateModalOpen(true);
  };

  const handleSelectClient = (val: string) => {
    if (!val) return;
    const foundContact = contacts.find(c => c.name === val);
    if (foundContact) {
      setClientName(foundContact.name);
      setClientEmail(foundContact.email || '');
      return;
    }
    const foundLead = leads.find(l => l.name === val || l.company === val);
    if (foundLead) {
      setClientName(foundLead.company ? `${foundLead.company}` : foundLead.name);
      setClientEmail(foundLead.email || '');
      if (foundLead.currency) setCurrency(foundLead.currency);
      return;
    }
    setClientName(val);
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: `item-${Date.now()}-${prev.length + 1}`, description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const handleUpdateItem = (id: string, field: 'description' | 'quantity' | 'unitPrice', value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      const q = field === 'quantity' ? Number(value) : item.quantity;
      const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
      updated.total = q * p;
      return updated;
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const tax = Math.round(subtotal * (Number(taxRate || 0) / 100));
  const total = subtotal + tax;

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !invoiceNumber || items.length === 0) return;

    addInvoice({
      invoiceNumber,
      clientName,
      clientEmail,
      items: items.map(it => ({
        id: it.id,
        description: it.description || 'Service Deliverable',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
      })),
      subtotal,
      tax,
      total,
      amountPaid: Number(initialAmountPaid) || 0,
      currency,
      status: initialAmountPaid >= total && total > 0 ? 'paid' : initialAmountPaid > 0 ? 'partially-paid' : invoiceStatus,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      notes,
    });

    setIsCreateModalOpen(false);
  };

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

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2 rounded-xl bg-[#0D52F8] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Create Invoice</span>
        </button>
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
          <table className="w-full text-left text-xs min-w-[720px]">
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

      {/* Create New Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0D52F8] text-white flex items-center justify-center font-bold">
                  <FileText size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Create Client Invoice</h2>
                  <p className="text-[11px] text-slate-500">Generate an automated multi-currency invoice with itemized billing.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 pt-4">
              {/* Client Auto-select & Basic Info */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Client Details</span>
                  {(contacts.length > 0 || leads.length > 0) && (
                    <select
                      onChange={e => handleSelectClient(e.target.value)}
                      defaultValue=""
                      className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
                    >
                      <option value="">Quick select from CRM contacts...</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.name}>{c.name} ({c.company || 'Contact'})</option>
                      ))}
                      {leads.map(l => (
                        <option key={l.id} value={l.company || l.name}>{l.company ? `${l.company} - ${l.name}` : l.name} (Lead)</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Client / Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FashionHub Lagos"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Client Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. billing@fashionhub.ng"
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-blue-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    Itemized Services / Deliverables
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-blue-50 text-[#0D52F8] hover:bg-blue-100 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition"
                  >
                    <Plus size={12} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Item or service description..."
                          value={item.description}
                          onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={e => handleUpdateItem(item.id, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-center"
                          title="Quantity"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          min={0}
                          required
                          value={item.unitPrice}
                          onChange={e => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-right"
                          title="Unit Price"
                        />
                      </div>
                      <div className="w-24 text-right font-mono font-bold text-slate-800 text-[11px]">
                        {formatCurrency(item.total, currency)}
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span>VAT / Tax (%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={taxRate}
                      onChange={e => setTaxRate(Number(e.target.value))}
                      className="w-14 px-1.5 py-0.5 border border-slate-200 rounded text-center bg-white text-xs"
                    />
                  </div>
                  <span className="font-semibold">{formatCurrency(tax, currency)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-[#0D52F8]">{formatCurrency(total, currency)}</span>
                </div>
              </div>

              {/* Status and Initial Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Invoice Status</label>
                  <select
                    value={invoiceStatus}
                    onChange={e => setInvoiceStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="partially-paid">Partially Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Amount Paid (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    max={total}
                    value={initialAmountPaid}
                    onChange={e => setInitialAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Balance</label>
                  <div className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-100 font-bold text-slate-800">
                    {formatCurrency(Math.max(0, total - (Number(initialAmountPaid) || 0)), currency)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes & Payment Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                  placeholder="Add payment terms or bank details..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Save & Generate Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
