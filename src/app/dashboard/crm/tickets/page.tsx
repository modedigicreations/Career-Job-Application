'use client';

import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Ticket } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function TicketsPage() {
  const { tickets, addTicket, updateTicketStatus } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [newModalOpen, setNewModalOpen] = useState(false);

  const [clientName, setClientName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Ticket['priority']>('medium');

  const filteredTickets = tickets.filter(t => {
    if (searchTerm && !t.subject.toLowerCase().includes(searchTerm.toLowerCase()) && !t.clientName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !subject) return;

    addTicket({
      clientName,
      subject,
      description,
      status: 'open',
      priority,
      assignedTo: 'u5',
    });

    setClientName('');
    setSubject('');
    setDescription('');
    setNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Client Support Tickets
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {tickets.length} Active Tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Resolve DNS, hosting, email, and software bug issues with SLA tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-mode-royal hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="font-bold text-slate-900">{t.subject}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{t.description}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {t.clientName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      t.priority === 'urgent'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : t.priority === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 capitalize">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      t.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : t.status === 'in-progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {t.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {formatDate(t.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={t.status}
                      onChange={e => updateTicketStatus(t.id, e.target.value as any)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Ticket Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setNewModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Create Support Ticket</h2>
            <form onSubmit={handleCreate} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="FashionHub Lagos"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject / Issue *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="DNS propagation delay on secondary nameserver"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description / Reproduction Steps</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mode-royal hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
