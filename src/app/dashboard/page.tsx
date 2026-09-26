'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Kanban,
  WalletCards,
  Target,
  Globe,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Users,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getDaysUntil, getUrgencyBadge, getRequisitionStatusBadge } from '@/lib/utils';

export default function ExecutiveCockpitPage() {
  const {
    leads,
    invoices,
    hostingAccounts,
    requisitions,
    goals,
    activities,
    currentUser,
    updateRequisitionDecision
  } = useAppStore();

  // Metrics computation
  const activeDeals = leads.filter(l => l.status !== 'won' && l.status !== 'lost');
  const wonDeals = leads.filter(l => l.status === 'won');
  
  const totalPipelineValue = activeDeals.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
  const totalRevenueWon = wonDeals.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

  const pendingRequisitions = requisitions.filter(r => r.status === 'Pending');
  const totalPendingExpense = pendingRequisitions.reduce((acc, curr) => acc + curr.amount, 0);

  const expiringHosting = hostingAccounts.filter(h => getDaysUntil(h.expiryDate) <= 45);

  const goalsOnTrack = goals.filter(g => g.progress >= 50);
  const goalsBehind = goals.filter(g => g.progress < 50 && g.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0B111E] via-[#0D214F] to-[#0D52F8] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                MODE Operations Suite
              </span>
              <span className="text-xs text-blue-200">Unified System Live</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight break-words">
              Welcome back, {currentUser.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
              Cross-operational overview: CRM Sales Pipeline, Staff Expense Requisitions, and One-Minute Leadership Goals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <Link
              href="/dashboard/crm/pipeline"
              className="px-3 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition shadow-sm flex items-center gap-1.5"
            >
              <Kanban size={14} className="text-blue-600" />
              <span>Sales Pipeline</span>
            </Link>
            <Link
              href="/dashboard/expenses"
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition border border-white/20 flex items-center gap-1.5"
            >
              <WalletCards size={14} />
              <span>Requisitions ({pendingRequisitions.length})</span>
            </Link>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute right-0 top-0 w-48 h-48 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pipeline Value */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Sales Pipeline</span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#0D52F8]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {formatCurrency(totalPipelineValue, 'NGN')}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-semibold text-emerald-600">{activeDeals.length} active deals</span>
            <span>across 8 stages</span>
          </div>
        </div>

        {/* Pending Requisitions */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Expenses</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <WalletCards size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {formatCurrency(totalPendingExpense, 'NGN')}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-semibold text-amber-600">{pendingRequisitions.length} requests</span>
            <span>awaiting decision</span>
          </div>
        </div>

        {/* Domain & Hosting Expirations */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Upcoming Renewals</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Globe size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {expiringHosting.length} Accounts
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-semibold text-purple-600">Within ≤ 45 days</span>
            <span>domains & SSL</span>
          </div>
        </div>

        {/* One-Minute Goal Health */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Team Goals Status</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Target size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {goalsOnTrack.length} / {goals.length}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-semibold text-emerald-600">{Math.round((goalsOnTrack.length / (goals.length || 1)) * 100)}% on track</span>
            <span>OMM tracking</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Quick Pending Requisitions Approvals (for MD & Managers) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <WalletCards size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Expense Requisitions Vetting Queue</h2>
                  <p className="text-[11px] text-slate-500">Approve, reject, or inspect staff purchase requests</p>
                </div>
              </div>
              <Link href="/dashboard/expenses" className="text-xs font-semibold text-[#0D52F8] hover:underline flex items-center gap-0.5">
                <span>View All ({requisitions.length})</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {pendingRequisitions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-500" />
                  All requisitions are cleared! No pending approvals.
                </div>
              ) : (
                pendingRequisitions.slice(0, 3).map(req => (
                  <div key={req.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{req.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getUrgencyBadge(req.urgency)}`}>
                          {req.urgency}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>By <strong className="text-slate-700">{req.staffName}</strong></span>
                        <span>•</span>
                        <span>{req.category}</span>
                        <span>•</span>
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-extrabold text-sm text-slate-900">
                          {formatCurrency(req.amount, req.currency)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{req.receiptNumber}</div>
                      </div>

                      {/* 1-Click Action Buttons for MD/Manager */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateRequisitionDecision(req.id, 'Approved', 'Approved via Executive Cockpit')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRequisitionDecision(req.id, 'Rejected', 'Rejected via Executive Cockpit')}
                          className="px-2 py-1.5 rounded-lg bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          <XCircle size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CRM Sales Pipeline Highlights */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-[#0D52F8]">
                  <Kanban size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Top Sales Leads & Proposals</h2>
                  <p className="text-[11px] text-slate-500">Highest value business opportunities</p>
                </div>
              </div>
              <Link href="/dashboard/crm/pipeline" className="text-xs font-semibold text-[#0D52F8] hover:underline flex items-center gap-0.5">
                <span>Open Kanban Board</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2">Client / Company</th>
                    <th className="pb-2">Service</th>
                    <th className="pb-2">Value</th>
                    <th className="pb-2">Stage</th>
                    <th className="pb-2 text-right">Close Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.slice(0, 5).map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900">{lead.name}</div>
                        <div className="text-[10px] text-slate-400">{lead.company}</div>
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {lead.serviceInterested.replace('-', ' ')}
                      </td>
                      <td className="py-2.5 font-bold text-slate-900">
                        {formatCurrency(lead.estimatedValue, lead.currency)}
                      </td>
                      <td className="py-2.5">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0D52F8] border border-blue-200">
                          {lead.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-500 font-mono text-[11px]">
                        {formatDate(lead.expectedCloseDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6 min-w-0">
          {/* Hosting & Renewal Alerts */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">Hosting Renewals</h2>
              </div>
              <Link href="/dashboard/crm/hosting" className="text-xs font-semibold text-purple-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {hostingAccounts.slice(0, 4).map(h => {
                const daysLeft = getDaysUntil(h.expiryDate);
                const isUrgent = daysLeft <= 30;
                return (
                  <div key={h.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/40 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{h.domainName}</div>
                      <div className="text-[10px] text-slate-400">{h.clientName}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isUrgent ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* One-Minute Goal Snapshot */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">1-Minute Goals</h2>
              </div>
              <Link href="/dashboard/omm/goals" className="text-xs font-semibold text-emerald-600 hover:underline">
                Manage
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {goals.slice(0, 3).map(g => (
                <div key={g.id} className="space-y-1.5 p-2 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">{g.objective}</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-600">{g.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{g.employee_name}</span>
                    <span>Due: {formatDate(g.deadline)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unified Activity Stream */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Live Activity Feed</h2>
              <span className="text-[10px] text-slate-400">System Logs</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {activities.slice(0, 4).map(act => (
                <div key={act.id} className="text-xs border-l-2 border-blue-500 pl-3 py-1">
                  <p className="text-slate-800 text-[11px] font-medium leading-snug">{act.description}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span>{act.user_name}</span>
                    <span>•</span>
                    <span>{act.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
