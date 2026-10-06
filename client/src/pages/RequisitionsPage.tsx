import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate, MANAGER_TIER } from '@/lib/utils';
import { ApiError } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { showToast } from '@/components/ui/Toast';
import { Plus, Receipt, Check, X, Trash2 } from 'lucide-react';
import type { Currency } from '@/types';

const emptyForm = { amount: 0, currency: 'NGN' as Currency, category: '', reason: '', date: new Date().toISOString().split('T')[0] };

export default function RequisitionsPage() {
  const { currentUser, requisitions, addRequisition, approveRequisition, rejectRequisition, deleteRequisition } = useStore();
  const canApprove = MANAGER_TIER.includes(currentUser.role);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return requisitions.filter((r) => statusFilter === 'all' || r.status === statusFilter);
  }, [requisitions, statusFilter]);

  const { pendingTotal, approvedTotal } = useMemo(() => ({
    pendingTotal: requisitions.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0),
    approvedTotal: requisitions.filter((r) => r.status === 'approved').reduce((s, r) => s + r.amount, 0),
  }), [requisitions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addRequisition(form);
      showToast('Requisition submitted');
      setShowForm(false);
      setForm(emptyForm);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to submit requisition', 'error');
    }
  }

  async function handleApprove(id: string) {
    try {
      await approveRequisition(id);
      showToast('Requisition approved');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to approve requisition', 'error');
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectRequisition(id);
      showToast('Requisition rejected');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to reject requisition', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this requisition?')) return;
    try {
      await deleteRequisition(id);
      showToast('Requisition deleted');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete requisition', 'error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Pending Requisitions</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(pendingTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Approved This Period</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(approvedTotal)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> New Requisition</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="No requisitions" description="Submit a requisition for an expense." action={<button onClick={() => setShowForm(true)} className="btn-primary">New Requisition</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header px-4 py-3">Requested By</th>
                  <th className="table-header px-4 py-3">Category</th>
                  <th className="table-header px-4 py-3">Reason</th>
                  <th className="table-header px-4 py-3">Amount</th>
                  <th className="table-header px-4 py-3">Date</th>
                  <th className="table-header px-4 py-3">Status</th>
                  <th className="table-header px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{r.requester?.name ?? 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{r.reason}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(r.amount, r.currency)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(r.date)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {canApprove && r.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(r.id)} title="Approve" className="p-1 rounded hover:bg-gray-100"><Check className="h-4 w-4 text-green-500" /></button>
                            <button onClick={() => handleReject(r.id)} title="Reject" className="p-1 rounded hover:bg-gray-100"><X className="h-4 w-4 text-red-500" /></button>
                          </>
                        )}
                        {(r.status === 'pending' || canApprove) && (
                          <button onClick={() => handleDelete(r.id)} title="Delete" className="p-1 rounded hover:bg-gray-100"><Trash2 className="h-4 w-4 text-red-400" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Requisition">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Category *</label><input required className="input" placeholder="e.g. Office Supplies, Transport" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><label className="label">Reason *</label><textarea required className="input" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><label className="label">Amount *</label><input required type="number" min="0.01" step="0.01" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
                <option value="NGN">NGN</option><option value="GBP">GBP</option><option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
