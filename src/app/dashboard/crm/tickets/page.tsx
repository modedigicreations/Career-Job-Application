'use client';

import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  MessageSquare,
  RefreshCw,
  Mail,
  Globe,
  Filter,
  Check,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Ticket, TicketSource } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function TicketsPage() {
  const { tickets, addTicket, updateTicketStatus, syncWhmcsTickets, users, currentUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Ticket['priority']>('medium');
  const [assignedTo, setAssignedTo] = useState(currentUser?.id || 'u5');
  const [sourceChannel, setSourceChannel] = useState<TicketSource>('manual');

  const filteredTickets = tickets.filter(t => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchSub = t.subject.toLowerCase().includes(q);
      const matchClient = t.clientName.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchNum = (t.ticketNumber || '').toLowerCase().includes(q);
      if (!matchSub && !matchClient && !matchDesc && !matchNum) return false;
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (channelFilter !== 'all' && t.sourceChannel !== channelFilter) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !subject) return;

    const assignedUser = users.find(u => u.id === assignedTo);

    addTicket({
      clientName,
      clientEmail: clientEmail || undefined,
      subject,
      description,
      status: 'open',
      priority,
      assignedTo,
      assignedStaffName: assignedUser?.full_name,
      sourceChannel,
    });

    setClientName('');
    setClientEmail('');
    setSubject('');
    setDescription('');
    setAssignedTo(currentUser?.id || 'u5');
    setSourceChannel('manual');
    setNewModalOpen(false);
  };

  const handleSyncTickets = async () => {
    setIsSyncing(true);
    setSyncToast(null);
    try {
      const result = await syncWhmcsTickets();
      if (result.success) {
        setSyncToast({
          type: 'success',
          message: result.message || `Successfully synced ${result.count ?? 0} support tickets.`
        });
      } else {
        setSyncToast({
          type: 'error',
          message: result.message || 'Failed to sync tickets from WHMCS / Email gateways.'
        });
      }
    } catch {
      setSyncToast({
        type: 'error',
        message: 'Network error communicating with support ticket sync gateway.'
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncToast(null), 5000);
    }
  };

  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const urgentCount = tickets.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'closed' && t.status !== 'resolved').length;
  const whmcsIngestedCount = tickets.filter(t => t.sourceChannel === 'whmcs').length;
  const emailIngestedCount = tickets.filter(t => t.sourceChannel === 'contact_email' || t.sourceChannel === 'billing_email').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Client Support Tickets
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {tickets.length} Total Tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Resolve DNS, hosting, email routing, and custom software issues with SLA tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleSyncTickets}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
            title="Sync tickets from WHMCS and email routing"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync WHMCS & Mail'}</span>
          </button>

          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-mode-royal hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Sync Toast */}
      {syncToast && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
          syncToast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {syncToast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{syncToast.message}</span>
          </div>
          <button onClick={() => setSyncToast(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Active / In-Flight</span>
            <LifeBuoy size={16} className="text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{openCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Urgent & High SLA</span>
            <AlertCircle size={16} className="text-rose-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{urgentCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">WHMCS Live Gateway</span>
            <Globe size={16} className="text-indigo-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{whmcsIngestedCount}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Email Gateway (Tech/Billing)</span>
            <Mail size={16} className="text-amber-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">{emailIngestedCount}</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by ticket #, client, subject, or description..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-mode-royal"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">Channel:</span>
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="whmcs">WHMCS Gateway</option>
              <option value="contact_email">contact@ Email</option>
              <option value="billing_email">billing@ Email</option>
              <option value="portal">Client Portal</option>
              <option value="manual">Manual Entry</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">Priority:</span>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 pt-3 text-xs">
          {[
            { id: 'all', label: 'All Tickets', count: tickets.length },
            { id: 'open', label: 'Open', count: tickets.filter(t => t.status === 'open').length },
            { id: 'in-progress', label: 'In Progress', count: tickets.filter(t => t.status === 'in-progress').length },
            { id: 'resolved', label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length },
            { id: 'closed', label: 'Closed', count: tickets.filter(t => t.status === 'closed').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] flex items-center gap-1.5 transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-mode-royal text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Ticket & Channel</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No tickets found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => {
                  const assigned = users.find(u => u.id === t.assignedTo);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800 text-[11px]">
                          {t.ticketNumber || `#TK-${t.id.slice(-4)}`}
                        </div>
                        <div className="mt-1">
                          {t.sourceChannel === 'whmcs' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Globe size={10} /> WHMCS
                            </span>
                          )}
                          {t.sourceChannel === 'contact_email' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Mail size={10} /> contact@
                            </span>
                          )}
                          {t.sourceChannel === 'billing_email' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              <Mail size={10} /> billing@
                            </span>
                          )}
                          {(!t.sourceChannel || t.sourceChannel === 'manual' || t.sourceChannel === 'portal') && (
                            <span className="text-[10px] text-slate-500 font-medium capitalize">
                              {t.sourceChannel || 'portal'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-slate-900">{t.subject}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate" title={t.description}>
                          {t.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <div>{t.clientName}</div>
                        {t.clientEmail && (
                          <div className="text-[10px] text-slate-400 font-normal">{t.clientEmail}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {assigned?.full_name || t.assignedStaffName || 'Unassigned'}
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
                            : t.status === 'closed'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
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
                          className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
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
            <p className="text-slate-500 mb-4">Log a new client ticket for DNS, hosting, email, or engineering resolution.</p>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-slate-700 font-semibold mb-1">Client Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-slate-700 font-semibold mb-1">Channel</label>
                  <select
                    value={sourceChannel}
                    onChange={e => setSourceChannel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="portal">Client Portal</option>
                    <option value="contact_email">contact@ Email</option>
                    <option value="billing_email">billing@ Email</option>
                    <option value="whmcs">WHMCS Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assign To Staff</label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.job_title || u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description / Reproduction Steps</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Details of the reported error, domain name, or requested change..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
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
