import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatDate, cn } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Search, Ticket, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import type { Ticket as TicketType, TicketStatus } from '@/types';

const emptyTicket: Omit<TicketType, 'id' | 'createdAt' | 'updatedAt'> = {
  clientId: '', clientName: '', subject: '', description: '',
  status: 'open', priority: 'medium', assignedTo: '',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function TicketsPage() {
  const { tickets, users, addTicket, updateTicket, deleteTicket } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TicketType | null>(null);
  const [form, setForm] = useState(emptyTicket);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.clientName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  function openCreate() { setEditing(null); setForm(emptyTicket); setShowForm(true); }
  function openEdit(ticket: TicketType) { setEditing(ticket); setForm(ticket); setShowForm(true); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();
    if (editing) {
      updateTicket(editing.id, form);
    } else {
      addTicket({ ...form, id: uuid(), createdAt: now, updatedAt: now } as TicketType);
    }
    setShowForm(false);
  }

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in-progress').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="badge bg-blue-100 text-blue-700">{openCount} Open</span>
        <span className="badge bg-yellow-100 text-yellow-700">{inProgressCount} In Progress</span>
        <span className="badge bg-green-100 text-green-700">{tickets.filter((t) => t.status === 'resolved').length} Resolved</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> New Ticket</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Ticket} title="No tickets" description="Create a support ticket to get started." action={<button onClick={openCreate} className="btn-primary">New Ticket</button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const assignee = users.find((u) => u.id === ticket.assignedTo);
            return (
              <div key={ticket.id} onClick={() => openEdit(ticket)} className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{ticket.subject}</h3>
                      <span className={cn('badge', PRIORITY_COLORS[ticket.priority])}>{ticket.priority}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{ticket.clientName}</p>
                    <p className="text-sm text-gray-600 line-clamp-1">{ticket.description}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  <span>Created {formatDate(ticket.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {assignee && <span>Assigned to {assignee.name}</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm('Delete this ticket?')) deleteTicket(ticket.id); }}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Ticket' : 'New Ticket'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Client Name *</label><input required className="input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
          <div><label className="label">Subject *</label><input required className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><label className="label">Description *</label><textarea required className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TicketType['priority'] })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TicketStatus })}>
                <option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Assign To</label>
            <select className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
