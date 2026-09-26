'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Kanban,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Filter,
  DollarSign,
  User,
  Building,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Lead, LeadStatus, Currency } from '@/lib/types';
import { formatCurrency, formatDate, getLeadStatusBadge } from '@/lib/utils';

const PIPELINE_STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new-lead', label: 'New Lead', color: 'border-t-sky-500' },
  { id: 'qualified', label: 'Qualified', color: 'border-t-indigo-500' },
  { id: 'contacted', label: 'Contacted', color: 'border-t-yellow-500' },
  { id: 'discovery-call', label: 'Discovery Call', color: 'border-t-cyan-500' },
  { id: 'proposal-sent', label: 'Proposal Sent', color: 'border-t-blue-600' },
  { id: 'negotiation', label: 'Negotiation', color: 'border-t-purple-600' },
  { id: 'won', label: 'Won 🎉', color: 'border-t-emerald-500' },
  { id: 'lost', label: 'Lost', color: 'border-t-slate-400' },
];

export default function PipelinePage() {
  const { leads, updateLeadStatus, addLead, deleteLead, users } = useAppStore();
  const [filterSource, setFilterSource] = useState<string>('all');
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);

  // New Lead Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceInterested, setServiceInterested] = useState<Lead['serviceInterested']>('website-development');
  const [source, setSource] = useState<Lead['source']>('website');
  const [budget, setBudget] = useState('1000000');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<LeadStatus>('new-lead');
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-10-30');
  const [assignedTo, setAssignedTo] = useState('u2');

  const filteredLeads = leads.filter(l => {
    if (filterSource !== 'all' && l.source !== filterSource) return false;
    return true;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    addLead({
      name,
      company,
      email,
      phone,
      serviceInterested,
      source,
      budget: parseFloat(budget) || 0,
      currency,
      notes,
      status,
      estimatedValue: parseFloat(budget) || 0,
      probability: status === 'won' ? 100 : 30,
      expectedCloseDate,
      assignedTo,
    });

    // Reset & close
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setNotes('');
    setNewLeadModalOpen(false);
  };

  const getStageTotal = (stageId: LeadStatus) => {
    const stageLeads = filteredLeads.filter(l => l.status === stageId);
    return stageLeads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Sales Pipeline Kanban
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {filteredLeads.length} Total Deals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Drag, update, and monitor opportunities from lead acquisition to closing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="facebook-ads">Facebook Ads</option>
            <option value="google-ads">Google Ads</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referral">Referral</option>
          </select>

          <button
            type="button"
            onClick={() => setNewLeadModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-[#0D52F8] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Board */}
      <div className="overflow-x-auto pb-6">
        <div className="flex items-start gap-4 min-w-[1400px]">
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.status === stage.id);
            const totalVal = getStageTotal(stage.id);

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 bg-slate-100/70 border border-slate-200 rounded-2xl p-3 flex flex-col max-h-[calc(100vh-210px)]"
              >
                {/* Column Header */}
                <div className={`pt-1 pb-3 px-1 border-t-4 ${stage.color} rounded-t-lg mb-2`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{stage.label}</span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-extrabold text-slate-900 mt-1">
                    {formatCurrency(totalVal, 'NGN')}
                  </div>
                </div>

                {/* Card Items List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      No deals here
                    </div>
                  ) : (
                    stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 leading-snug">
                            {lead.company}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                            {formatCurrency(lead.estimatedValue, lead.currency)}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <User size={11} className="text-slate-400" />
                            <span className="truncate">{lead.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Service: {lead.serviceInterested.replace('-', ' ')}
                          </div>
                        </div>

                        {/* Move stage selector */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <select
                            value={lead.status}
                            onChange={e => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 focus:outline-none"
                          >
                            {PIPELINE_STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => deleteLead(lead.id)}
                            className="text-[10px] text-slate-400 hover:text-rose-600 transition"
                            title="Delete Deal"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Deal Modal */}
      {newLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setNewLeadModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
            <h2 className="text-base font-bold text-slate-900 mb-1">Add Sales Opportunity</h2>
            <p className="text-xs text-slate-500 mb-4">Enter client requirements to capture in pipeline.</p>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Name *</label>
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
                  <label className="block text-slate-700 font-semibold mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. TechVenture Nigeria"
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
                    placeholder="client@domain.ng"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Estimated Budget</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Service</label>
                  <select
                    value={serviceInterested}
                    onChange={e => setServiceInterested(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="website-development">Website Development</option>
                    <option value="ecommerce-development">E-commerce</option>
                    <option value="lms-development">LMS Platform</option>
                    <option value="cbt-platform">ModeCBT Solutions</option>
                    <option value="web-hosting">Cloud Hosting</option>
                    <option value="custom-software">Custom Software</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pipeline Stage</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    {PIPELINE_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewLeadModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
