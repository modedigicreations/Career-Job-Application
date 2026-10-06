import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatDate, exportToCsv } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Search, UserCircle, Trash2, Edit2, Mail, Phone, Download } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { showToast } from '@/components/ui/Toast';
import type { Contact } from '@/types';

const emptyContact: Omit<Contact, 'id' | 'createdAt'> = {
  name: '', email: '', phone: '', company: '', position: '', notes: '', isActive: true,
};

export default function ContactsPage() {
  const { contacts, addContact, updateContact, deleteContact } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(emptyContact);

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
  }, [contacts, search]);

  function openCreate() { setEditing(null); setForm(emptyContact); setShowForm(true); }
  function openEdit(contact: Contact) { setEditing(contact); setForm(contact); setShowForm(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await updateContact(editing.id, form);
        showToast('Contact updated successfully');
      } else {
        await addContact(form);
        showToast('Contact created successfully');
      }
      setShowForm(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to save contact', 'error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCsv('contacts-export', ['Name', 'Email', 'Phone', 'Company', 'Position', 'Active', 'Created'],
              filtered.map((c) => [c.name, c.email, c.phone, c.company, c.position, c.isActive ? 'Yes' : 'No', c.createdAt])
            )}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
          <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> Add Contact</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={UserCircle} title="No contacts found" description="Add contacts to manage your relationships." action={<button onClick={openCreate} className="btn-primary">Add Contact</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((contact) => (
            <div key={contact.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                    {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.position} at {contact.company}</p>
                  </div>
                </div>
                <StatusBadge status={contact.isActive ? 'active' : 'inactive'} />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400" /> {contact.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400" /> {contact.phone}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">Added {formatDate(contact.createdAt)}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(contact)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="h-4 w-4 text-gray-400" /></button>
                  <button onClick={async () => { if (confirm('Delete this contact?')) { try { await deleteContact(contact.id); showToast('Contact deleted'); } catch (err) { showToast(err instanceof ApiError ? err.message : 'Failed to delete contact', 'error'); } } }} className="p-1 rounded hover:bg-gray-100"><Trash2 className="h-4 w-4 text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Contact' : 'Add Contact'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Full Name *</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email *</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          <div><label className="label">Position</label><input className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /><label htmlFor="active" className="text-sm text-gray-700">Active</label></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
