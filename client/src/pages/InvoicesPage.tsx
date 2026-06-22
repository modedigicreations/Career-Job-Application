import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import StatCard from '@/components/ui/StatCard';
import { Plus, Search, FileText, DollarSign, Clock, CheckCircle2, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import type { Invoice, InvoiceItem, InvoiceStatus, Currency } from '@/types';

const emptyInvoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'> = {
  clientId: '', clientName: '', clientEmail: '', items: [],
  subtotal: 0, tax: 0, total: 0, amountPaid: 0, currency: 'NGN',
  status: 'draft', issueDate: new Date().toISOString().split('T')[0],
  dueDate: '', notes: '',
};

export default function InvoicesPage() {
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyInvoice);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = !search || inv.clientName.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const outstanding = invoices.filter((i) => ['sent', 'partially-paid', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.total - i.amountPaid), 0);
  const overdueCount = invoices.filter((i) => i.status === 'overdue' || (i.status === 'sent' && new Date(i.dueDate) < new Date())).length;

  function openCreate() {
    setForm(emptyInvoice);
    setItems([{ id: uuid(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setShowForm(true);
  }

  function addItem() {
    setItems([...items, { id: uuid(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].total = updated[index].quantity * updated[index].unitPrice;
    }
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax = subtotal * 0.075;
    const total = subtotal + tax;
    const maxNum = invoices.reduce((max, inv) => {
      const match = inv.invoiceNumber.match(/INV-\d+-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(maxNum + 1).padStart(3, '0')}`;
    addInvoice({
      ...form, id: uuid(), invoiceNumber, items, subtotal, tax, total,
      createdAt: new Date().toISOString(),
    } as Invoice);
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} iconColor="bg-green-100 text-green-600" />
        <StatCard title="Outstanding" value={formatCurrency(outstanding)} icon={Clock} iconColor="bg-amber-100 text-amber-600" />
        <StatCard title="Overdue" value={overdueCount} icon={AlertCircle} iconColor="bg-red-100 text-red-600" />
        <StatCard title="Total Invoices" value={invoices.length} icon={FileText} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="partially-paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> Create Invoice</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices" description="Create your first invoice." action={<button onClick={openCreate} className="btn-primary">Create Invoice</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header px-4 py-3">Invoice #</th>
                  <th className="table-header px-4 py-3">Client</th>
                  <th className="table-header px-4 py-3">Issue Date</th>
                  <th className="table-header px-4 py-3">Due Date</th>
                  <th className="table-header px-4 py-3">Total</th>
                  <th className="table-header px-4 py-3">Paid</th>
                  <th className="table-header px-4 py-3">Balance</th>
                  <th className="table-header px-4 py-3">Status</th>
                  <th className="table-header px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-brand-600">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{invoice.clientName}</p>
                      <p className="text-xs text-gray-500">{invoice.clientEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(invoice.issueDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(invoice.amountPaid, invoice.currency)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(invoice.total - invoice.amountPaid, invoice.currency)}</td>
                    <td className="px-4 py-3"><StatusBadge status={invoice.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link to={`/invoices/${invoice.id}`} className="p-1 rounded hover:bg-gray-100"><Eye className="h-4 w-4 text-gray-400" /></Link>
                        <button onClick={() => { if (confirm('Delete?')) deleteInvoice(invoice.id); }} className="p-1 rounded hover:bg-gray-100"><Trash2 className="h-4 w-4 text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Invoice" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div><label className="label">Client Name *</label><input required className="input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
            <div><label className="label">Client Email *</label><input required type="email" className="input" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} /></div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
                <option value="NGN">NGN (₦)</option><option value="GBP">GBP (£)</option><option value="USD">USD ($)</option>
              </select>
            </div>
            <div><label className="label">Issue Date</label><input type="date" className="input" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} /></div>
            <div><label className="label">Due Date *</label><input required type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}>
                <option value="draft">Draft</option><option value="sent">Sent</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Line Items</label>
              <button type="button" onClick={addItem} className="text-xs text-brand-500 font-medium hover:text-brand-700">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5"><input placeholder="Description" className="input" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} /></div>
                  <div className="col-span-2"><input type="number" placeholder="Qty" min="1" className="input" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} /></div>
                  <div className="col-span-2"><input type="number" placeholder="Price" className="input" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))} /></div>
                  <div className="col-span-2 text-sm font-medium text-gray-900 py-2">{formatCurrency(item.total, form.currency)}</div>
                  <div className="col-span-1">{items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <div className="text-right text-sm space-y-1">
                <p>Subtotal: <strong>{formatCurrency(items.reduce((s, i) => s + i.total, 0), form.currency)}</strong></p>
                <p>Tax (7.5%): <strong>{formatCurrency(items.reduce((s, i) => s + i.total, 0) * 0.075, form.currency)}</strong></p>
                <p className="text-base">Total: <strong>{formatCurrency(items.reduce((s, i) => s + i.total, 0) * 1.075, form.currency)}</strong></p>
              </div>
            </div>
          </div>

          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Invoice</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
