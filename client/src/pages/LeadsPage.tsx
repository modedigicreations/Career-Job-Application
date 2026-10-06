import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate, getInitials, exportToCsv } from '@/lib/utils';
import { ApiError } from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import WhatsAppBroadcastModal from '@/components/ui/WhatsAppBroadcastModal';
import { Plus, Search, Users, Trash2, Edit2, Eye, Download, MessageCircle } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import type { Lead, LeadStatus, LeadSource, ServiceType, Currency } from '@/types';

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'website-development', label: 'Website Development' },
  { value: 'ecommerce-development', label: 'E-commerce Development' },
  { value: 'lms-development', label: 'LMS Development' },
  { value: 'custom-software', label: 'Custom Software' },
  { value: 'seo-services', label: 'SEO Services' },
  { value: 'web-hosting', label: 'Web Hosting' },
  { value: 'domain-registration', label: 'Domain Registration' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'social-media-management', label: 'Social Media Management' },
  { value: 'cbt-platform', label: 'CBT Platform' },
];

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'facebook-ads', label: 'Facebook Ads' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'manual', label: 'Manual Entry' },
  { value: 'csv-import', label: 'CSV Import' },
  { value: 'referral', label: 'Referral' },
];

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new-lead', label: 'New Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'discovery-call', label: 'Discovery Call' },
  { value: 'proposal-sent', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const emptyLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', company: '', email: '', phone: '', serviceInterested: 'website-development',
  source: 'website', budget: 0, currency: 'NGN', notes: '', designation: '', address: '', status: 'new-lead',
  estimatedValue: 0, probability: 20, expectedCloseDate: '', assignedTo: '',
};

export default function LeadsPage() {
  const { leads, users, addLead, updateLead, deleteLead } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form, setForm] = useState(emptyLead);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch = !search || lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.company.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  function openCreate() {
    setEditingLead(null);
    setForm(emptyLead);
    setShowForm(true);
  }

  function openEdit(lead: Lead) {
    setEditingLead(lead);
    setForm(lead);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingLead) {
        await updateLead(editingLead.id, { ...form });
        showToast('Lead updated successfully');
      } else {
        await addLead(form);
        showToast('Lead created successfully');
      }
      setShowForm(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to save lead', 'error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCsv('leads-export', ['Name', 'Company', 'Email', 'Phone', 'Service', 'Source', 'Value', 'Currency', 'Probability', 'Status', 'Created'],
              filtered.map((l) => [l.name, l.company, l.email, l.phone, l.serviceInterested, l.source, String(l.estimatedValue), l.currency, String(l.probability), l.status, l.createdAt])
            )}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
          <button onClick={() => setShowBroadcast(true)} className="btn-secondary">
            <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Broadcast
          </button>
          <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> Add Lead</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No leads found" description="Get started by adding your first lead or adjusting your filters." action={<button onClick={openCreate} className="btn-primary">Add Lead</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header px-4 py-3">Lead</th>
                  <th className="table-header px-4 py-3">Service</th>
                  <th className="table-header px-4 py-3">Source</th>
                  <th className="table-header px-4 py-3">Value</th>
                  <th className="table-header px-4 py-3">Probability</th>
                  <th className="table-header px-4 py-3">Status</th>
                  <th className="table-header px-4 py-3">Assigned</th>
                  <th className="table-header px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((lead) => {
                  const assignee = users.find((u) => u.id === lead.assignedTo);
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                          <p className="text-xs text-gray-500">{lead.company}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {SERVICE_OPTIONS.find((s) => s.value === lead.serviceInterested)?.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{lead.source.replace(/-/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(lead.estimatedValue, lead.currency)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-gray-200">
                            <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${lead.probability}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{lead.probability}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3">
                        {assignee && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-600">
                              {getInitials(assignee.name)}
                            </div>
                            <span className="text-xs text-gray-600">{assignee.name.split(' ')[0]}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setShowDetail(lead)} className="p-1 rounded hover:bg-gray-100"><Eye className="h-4 w-4 text-gray-400" /></button>
                          <button onClick={() => openEdit(lead)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="h-4 w-4 text-gray-400" /></button>
                          <button onClick={async () => { if (confirm('Delete this lead?')) { try { await deleteLead(lead.id); showToast('Lead deleted'); } catch (err) { showToast(err instanceof ApiError ? err.message : 'Failed to delete lead', 'error'); } } }} className="p-1 rounded hover:bg-gray-100"><Trash2 className="h-4 w-4 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingLead ? 'Edit Lead' : 'Add New Lead'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="label">Name *</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Company *</label><input required className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><label className="label">Email *</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="label">Contact Designation</label><input className="input" placeholder="e.g. CEO, Operations Manager" value={form.designation || ''} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
            <div><label className="label">Address</label><input className="input" placeholder="Lead / company address" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div>
              <label className="label">Service Interested In</label>
              <select className="input" value={form.serviceInterested} onChange={(e) => setForm({ ...form, serviceInterested: e.target.value as ServiceType })}>
                {SERVICE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Lead Source</label>
              <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}>
                {SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
                <option value="NGN">NGN (₦)</option>
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div><label className="label">Budget</label><input type="number" className="input" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value), estimatedValue: Number(e.target.value) })} /></div>
            <div><label className="label">Probability (%)</label><input type="number" min="0" max="100" className="input" value={form.probability} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} /></div>
            <div><label className="label">Expected Close Date</label><input type="date" className="input" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} /></div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Assigned To</label>
              <select className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Select...</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingLead ? 'Update Lead' : 'Create Lead'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Lead Details" size="lg">
        {showDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Name</p><p className="text-sm font-medium">{showDetail.name}</p></div>
              <div><p className="text-xs text-gray-500">Company</p><p className="text-sm font-medium">{showDetail.company}</p></div>
              <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{showDetail.email}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium">{showDetail.phone}</p></div>
              <div><p className="text-xs text-gray-500">Designation</p><p className="text-sm font-medium">{showDetail.designation || '-'}</p></div>
              <div><p className="text-xs text-gray-500">Address</p><p className="text-sm font-medium">{showDetail.address || '-'}</p></div>
              <div><p className="text-xs text-gray-500">Service</p><p className="text-sm font-medium">{SERVICE_OPTIONS.find((s) => s.value === showDetail.serviceInterested)?.label}</p></div>
              <div><p className="text-xs text-gray-500">Source</p><p className="text-sm font-medium capitalize">{showDetail.source.replace(/-/g, ' ')}</p></div>
              <div><p className="text-xs text-gray-500">Estimated Value</p><p className="text-sm font-medium">{formatCurrency(showDetail.estimatedValue, showDetail.currency)}</p></div>
              <div><p className="text-xs text-gray-500">Probability</p><p className="text-sm font-medium">{showDetail.probability}%</p></div>
              <div><p className="text-xs text-gray-500">Expected Close</p><p className="text-sm font-medium">{showDetail.expectedCloseDate ? formatDate(showDetail.expectedCloseDate) : '-'}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><StatusBadge status={showDetail.status} /></div>
              <div><p className="text-xs text-gray-500">Created</p><p className="text-sm font-medium">{formatDate(showDetail.createdAt)}</p></div>
              <div><p className="text-xs text-gray-500">Updated</p><p className="text-sm font-medium">{formatDate(showDetail.updatedAt)}</p></div>
            </div>
            {showDetail.notes && <div><p className="text-xs text-gray-500">Notes</p><p className="text-sm text-gray-700 mt-1">{showDetail.notes}</p></div>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setShowDetail(null); openEdit(showDetail); }} className="btn-secondary"><Edit2 className="h-4 w-4 mr-1" /> Edit</button>
            </div>
          </div>
        )}
      </Modal>

      <WhatsAppBroadcastModal
        isOpen={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        candidates={showBroadcast ? filtered.map((l) => ({ id: l.id, name: l.name, phone: l.phone })) : []}
      />
    </div>
  );
}
