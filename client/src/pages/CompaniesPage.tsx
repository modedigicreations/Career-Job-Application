import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Search, Building2, Trash2, Edit2, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import type { Company } from '@/types';

const emptyCompany: Omit<Company, 'id' | 'createdAt'> = {
  name: '', industry: '', website: '', email: '', phone: '', address: '', contactIds: [],
};

export default function CompaniesPage() {
  const { companies, contacts, addCompany, updateCompany, deleteCompany } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState(emptyCompany);

  const filtered = useMemo(() => {
    if (!search) return companies;
    const q = search.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
  }, [companies, search]);

  function openCreate() { setEditing(null); setForm(emptyCompany); setShowForm(true); }
  function openEdit(company: Company) { setEditing(company); setForm(company); setShowForm(true); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateCompany(editing.id, form);
    } else {
      addCompany({ ...form, id: uuid(), createdAt: new Date().toISOString() } as Company);
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> Add Company</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No companies found" description="Add companies to organize your business relationships." action={<button onClick={openCreate} className="btn-primary">Add Company</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((company) => {
            const companyContacts = contacts.filter((c) => company.contactIds.includes(c.id));
            return (
              <div key={company.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-600">
                      {company.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                      <p className="text-xs text-gray-500">{company.industry}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(company)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="h-4 w-4 text-gray-400" /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteCompany(company.id); }} className="p-1 rounded hover:bg-gray-100"><Trash2 className="h-4 w-4 text-red-400" /></button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-600">
                  {company.website && <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-gray-400" /> {company.website}</div>}
                  {company.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" /> {company.email}</div>}
                  {company.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" /> {company.phone}</div>}
                  {company.address && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {company.address}</div>}
                </div>
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400">{companyContacts.length} contact{companyContacts.length !== 1 ? 's' : ''} &middot; Added {formatDate(company.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Company' : 'Add Company'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Company Name *</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Industry</label><input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
          <div><label className="label">Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Address</label><textarea className="input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
