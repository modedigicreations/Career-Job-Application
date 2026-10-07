'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Building,
  Kanban,
  Edit3,
  MapPin,
  Briefcase,
  Send,
  X,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Lead, LeadStatus, Currency } from '@/lib/types';
import { formatCurrency, formatDate, getLeadStatusBadge, formatWhatsAppUrl, formatMailtoUrl } from '@/lib/utils';

const WhatsAppIcon = ({ className = "w-3 h-3 fill-current" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function LeadsPage() {
  const { leads, addLead, updateLead, updateLeadStatus, deleteLead } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastExtraNumbers, setBroadcastExtraNumbers] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastError, setBroadcastError] = useState('');
  const [broadcastResults, setBroadcastResults] = useState<{ phone: string; success: boolean; error?: string }[] | null>(null);

  // Lead Form State — shared by both "New Lead" and "Edit Lead"
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [address, setAddress] = useState('');
  const [serviceInterested, setServiceInterested] = useState<Lead['serviceInterested']>('website-development');
  const [source, setSource] = useState<Lead['source']>('website');
  const [budget, setBudget] = useState('1500000');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [notes, setNotes] = useState('');

  const filteredLeads = leads.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (searchTerm && !l.name.toLowerCase().includes(searchTerm.toLowerCase()) && !l.company.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const resetForm = () => {
    setName(''); setCompany(''); setEmail(''); setPhone('');
    setDesignation(''); setAddress(''); setNotes('');
    setServiceInterested('website-development'); setSource('website');
    setBudget('1500000'); setCurrency('NGN');
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setName(lead.name);
    setCompany(lead.company);
    setEmail(lead.email);
    setPhone(lead.phone);
    setDesignation(lead.designation || '');
    setAddress(lead.address || '');
    setServiceInterested(lead.serviceInterested);
    setSource(lead.source);
    setBudget(String(lead.budget));
    setCurrency(lead.currency);
    setNotes(lead.notes || '');
  };

  const closeModal = () => {
    setNewModalOpen(false);
    setEditingLead(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    if (editingLead) {
      updateLead(editingLead.id, {
        name, company, email, phone, designation, address,
        serviceInterested, source,
        budget: parseFloat(budget) || 0,
        currency, notes,
      });
    } else {
      addLead({
        name,
        company,
        email,
        phone,
        designation,
        address,
        serviceInterested,
        source,
        budget: parseFloat(budget) || 0,
        currency,
        notes,
        status: 'new-lead',
        estimatedValue: parseFloat(budget) || 0,
        probability: 25,
        expectedCloseDate: '2026-10-30',
        assignedTo: 'u2',
      });
    }

    resetForm();
    closeModal();
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Service', 'Source', 'Budget', 'Currency', 'Status'];
    const rows = filteredLeads.map(l => [
      `"${l.name}"`,
      `"${l.company}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.serviceInterested}"`,
      `"${l.source}"`,
      l.budget,
      l.currency,
      `"${l.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mode_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openBroadcastModal = () => {
    setBroadcastError('');
    setBroadcastResults(null);
    setBroadcastExtraNumbers('');
    setBroadcastMessage('');
    setBroadcastModalOpen(true);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastError('');
    setBroadcastResults(null);

    const selectedPhones = leads.filter(l => selectedLeadIds.has(l.id)).map(l => l.phone);
    const extraPhones = broadcastExtraNumbers.split(/[\n,]/).map(p => p.trim()).filter(Boolean);
    const phoneNumbers = Array.from(new Set([...selectedPhones, ...extraPhones]));

    if (phoneNumbers.length === 0) {
      setBroadcastError('Select at least one lead or add a phone number.');
      return;
    }
    if (!broadcastMessage.trim()) {
      setBroadcastError('Message text is required.');
      return;
    }

    setBroadcastSending(true);
    try {
      const res = await fetch('/api/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumbers, message: broadcastMessage })
      });
      const data = await res.json();
      if (!data.success) {
        setBroadcastError(data.message || 'Broadcast failed.');
        return;
      }
      setBroadcastResults(data.results);
    } catch {
      setBroadcastError('Failed to reach the server.');
    } finally {
      setBroadcastSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Leads & Inbound Inquiries
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {leads.length} Contacts Captured
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Capture, qualify, and convert inquiries across Website, WhatsApp, Ads, and Referrals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openBroadcastModal}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-emerald-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-emerald-50 transition cursor-pointer"
          >
            <Send size={14} />
            <span>WhatsApp Broadcast{selectedLeadIds.size > 0 ? ` (${selectedLeadIds.size})` : ''}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => { resetForm(); setNewModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-[#0D52F8] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lead or organization..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none capitalize"
          >
            <option value="all">All Stages</option>
            <option value="new-lead">New Lead</option>
            <option value="qualified">Qualified</option>
            <option value="discovery-call">Discovery Call</option>
            <option value="proposal-sent">Proposal Sent</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.has(l.id))}
                    onChange={e => {
                      setSelectedLeadIds(prev => {
                        const next = new Set(prev);
                        if (e.target.checked) filteredLeads.forEach(l => next.add(l.id));
                        else filteredLeads.forEach(l => next.delete(l.id));
                        return next;
                      });
                    }}
                    className="rounded border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Contact & Company</th>
                <th className="py-3 px-4">Direct Contact</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Estimated Budget</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-3">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.has(lead.id)}
                      onChange={() => toggleLeadSelection(lead.id)}
                      className="rounded border-slate-300 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 leading-snug">{lead.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {lead.designation ? `${lead.designation}, ` : ''}{lead.company}
                    </div>
                    {lead.address && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate max-w-[180px]">{lead.address}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400 shrink-0" />
                      <a
                        href={formatMailtoUrl(lead.email, `Inquiry regarding ${lead.serviceInterested.replace('-', ' ')} - MODE DIGITAL CREATIONS`, `Hello ${lead.name},\n\nThank you for reaching out to MODE DIGITAL CREATIONS regarding ${lead.serviceInterested.replace('-', ' ')}.`)}
                        className="text-slate-600 hover:text-[#0D52F8] hover:underline transition truncate max-w-[170px]"
                        title={`Email ${lead.email}`}
                      >
                        {lead.email}
                      </a>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <a
                          href={formatWhatsAppUrl(lead.phone, `Hello ${lead.name}, this is MODE DIGITAL CREATIONS following up on your inquiry for ${lead.serviceInterested.replace('-', ' ')}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-emerald-600 hover:underline transition flex items-center gap-1"
                          title="Chat on WhatsApp"
                        >
                          <span>{lead.phone}</span>
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            WhatsApp
                          </span>
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 capitalize">
                    {lead.serviceInterested.replace('-', ' ')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2 py-0.5 rounded-md text-[10px] bg-slate-100 font-medium text-slate-700 border border-slate-200">
                      {lead.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(lead.budget, lead.currency)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getLeadStatusBadge(lead.status)}`}>
                      {lead.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {lead.phone && (
                        <a
                          href={formatWhatsAppUrl(lead.phone, `Hello ${lead.name}, this is MODE DIGITAL CREATIONS following up on your inquiry for ${lead.serviceInterested.replace('-', ' ')}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition"
                          title="Direct WhatsApp Chat"
                        >
                          <WhatsAppIcon className="w-3 h-3 fill-white" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                      <a
                        href={formatMailtoUrl(lead.email, `MODE DIGITAL CREATIONS - Follow-up on ${lead.serviceInterested.replace('-', ' ')}`, `Hello ${lead.name},\n\nWe are following up on your inquiry for ${lead.serviceInterested.replace('-', ' ')} at MODE DIGITAL CREATIONS.`)}
                        className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0D52F8] border border-blue-200 text-[11px] font-semibold flex items-center gap-1 transition"
                        title="Direct Email"
                      >
                        <Mail size={12} />
                        <span className="hidden sm:inline">Email</span>
                      </a>
                      <Link
                        href="/dashboard/crm/pipeline"
                        className="text-slate-500 hover:text-[#0D52F8] font-semibold text-xs px-1.5 py-1"
                      >
                        Pipeline
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditModal(lead)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0D52F8] hover:bg-blue-50 transition"
                        title="Edit Lead"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (confirm(`Delete lead "${lead.name}"?`)) deleteLead(lead.id); }}
                        className="text-slate-400 hover:text-rose-600 text-xs px-1"
                        title="Delete Lead"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lead Modal */}
      {(newModalOpen || editingLead) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 mb-1">{editingLead ? 'Edit Lead' : 'New Client Lead'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Chukwudi Abiola"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="TechVenture Nigeria"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="client@mail.ng"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Briefcase size={11} className="text-slate-400" /> Contact&apos;s Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    placeholder="e.g. CEO, Procurement Manager"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400" /> Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Lead / company address"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimated Budget (₦)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lead Source</label>
                  <select
                    value={source}
                    onChange={e => setSource(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="website">Website Form</option>
                    <option value="whatsapp">WhatsApp Direct</option>
                    <option value="facebook-ads">Facebook Ads</option>
                    <option value="google-ads">Google Ads</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any context about this lead..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  {editingLead ? 'Save Changes' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Broadcast Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setBroadcastModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <WhatsAppIcon className="w-4 h-4 fill-emerald-600" /> WhatsApp Broadcast
              </h2>
              <button type="button" onClick={() => setBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Sends via WATI to the selected leads and/or any numbers you add below. Requires WATI to be configured under Settings.</p>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
              {broadcastError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">{broadcastError}</div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Selected Leads ({selectedLeadIds.size})
                </label>
                <div className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 min-h-[2.25rem]">
                  {selectedLeadIds.size === 0
                    ? <span className="text-slate-400">None selected — tick leads in the table, or just add numbers below.</span>
                    : leads.filter(l => selectedLeadIds.has(l.id)).map(l => l.name).join(', ')}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Additional Phone Numbers</label>
                <textarea
                  rows={2}
                  value={broadcastExtraNumbers}
                  onChange={e => setBroadcastExtraNumbers(e.target.value)}
                  placeholder="One per line or comma-separated, e.g. 08012345678, 08098765432"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Type the WhatsApp message to send..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {broadcastResults && (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {broadcastResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5">
                      <span className="font-mono text-slate-700">{r.phone}</span>
                      {r.success ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 size={12} /> Sent</span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 font-semibold" title={r.error}><XCircle size={12} /> Failed</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={broadcastSending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold transition flex items-center gap-1.5"
                >
                  <Send size={13} />
                  {broadcastSending ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
