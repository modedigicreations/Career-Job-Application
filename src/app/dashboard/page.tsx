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
  Building,
  Megaphone,
  Check,
  Eye,
  X,
  FileText
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getDaysUntil, getUrgencyBadge, getRequisitionStatusBadge, isManagementUser, getMemoPriorityBadge, getMemoCategoryBadge } from '@/lib/utils';
import type { StaffMemo } from '@/lib/types';

export default function ExecutiveCockpitPage() {
  const {
    leads,
    invoices,
    hostingAccounts,
    requisitions,
    goals,
    activities,
    currentUser,
    updateRequisitionDecision,
    shifts,
    memos,
    markMemoAsRead,
    acknowledgeMemo
  } = useAppStore();

  const [dashboardMemoModal, setDashboardMemoModal] = React.useState<StaffMemo | null>(null);

  // Memos relevant to the active staff user
  const isManager = isManagementUser(currentUser.role);
  const userMemos = memos.filter(m => {
    if (m.senderId === currentUser.id) return true;
    if (m.targetAudience === 'all') return true;
    if (m.targetAudience === 'department' && m.targetDepartment?.toLowerCase() === currentUser.department?.toLowerCase()) return true;
    if (m.targetAudience === 'specific_staff' && m.targetStaffIds?.includes(currentUser.id)) return true;
    if (isManager) return true;
    return false;
  });

  const unreadMemos = userMemos.filter(m => !m.readBy?.[currentUser.id]);
  const unreadUrgentMemo = userMemos.find(m => m.priority === 'urgent' && !m.readBy?.[currentUser.id]);

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

      {/* Urgent Management Directive Alert Banner (if unread urgent memo exists) */}
      {unreadUrgentMemo && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-rose-800 text-white shadow-lg border border-rose-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-rose-200 border border-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/40 text-rose-200 px-2 py-0.5 rounded-full border border-rose-400/40">
                  Urgent Directive From Management
                </span>
                <span className="text-xs text-rose-300 font-mono">{unreadUrgentMemo.memoNumber}</span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white mt-0.5">
                {unreadUrgentMemo.title}
              </h3>
              <p className="text-xs text-rose-100/80 mt-0.5">
                Issued by {unreadUrgentMemo.senderName} ({unreadUrgentMemo.senderDepartment || 'Executive'}). Immediate staff action &amp; acknowledgment required.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                markMemoAsRead(unreadUrgentMemo.id);
                setDashboardMemoModal(unreadUrgentMemo);
              }}
              className="px-4 py-2 rounded-xl bg-white text-rose-950 font-bold text-xs hover:bg-rose-50 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Review &amp; Sign-off</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Live Staff on Shift Widget */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm">Today&apos;s Daily Staff Shifts</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{shifts.filter(s => s.status === 'active').length} Staff Clocked In</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Staff shifts are actively logged for today to compute work hours and compensation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <div className="flex -space-x-2 overflow-hidden">
            {shifts.filter(s => s.status === 'active').slice(0, 4).map(s => (
              <div key={s.id} className="w-7 h-7 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-xs" title={`${s.staffName} (${s.jobTitle})`}>
                {s.staffName[0]}
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/payroll"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ml-1"
          >
            <span>Shift &amp; Payroll Cockpit</span>
            <ChevronRight size={13} />
          </Link>
        </div>
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
          {/* Official Management Directives & Staff Memos */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Megaphone size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">Official Management Directives</h2>
                    {unreadMemos.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                        {unreadMemos.length} New
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">Executive circulars, company policies, and operational notices</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isManager && (
                  <Link
                    href="/dashboard/memos?action=create"
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition flex items-center gap-1"
                  >
                    <span>+ Issue Memo</span>
                  </Link>
                )}
                <Link href="/dashboard/memos" className="text-xs font-semibold text-[#0D52F8] hover:underline flex items-center gap-0.5">
                  <span>View All ({userMemos.length})</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {userMemos.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-500" />
                  No active management directives at this time.
                </div>
              ) : (
                userMemos.slice(0, 3).map(memo => {
                  const isRead = !!memo.readBy[currentUser.id];
                  const isAck = !!memo.acknowledgedBy[currentUser.id];
                  const needsAck = memo.requiresAcknowledgment && !isAck;

                  return (
                    <div
                      key={memo.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        !isRead
                          ? 'border-blue-400 bg-blue-50/30'
                          : needsAck
                          ? 'border-amber-300 bg-amber-50/20'
                          : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-slate-400">{memo.memoNumber}</span>
                          <span className="font-bold text-xs text-slate-900">{memo.title}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getMemoPriorityBadge(memo.priority)}`}>
                            {memo.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                          <span>From <strong className="text-slate-700">{memo.senderName}</strong></span>
                          <span>•</span>
                          <span>To: {memo.targetAudience === 'all' ? 'All Staff' : memo.targetDepartment || 'Direct'}</span>
                          <span>•</span>
                          <span>{formatDate(memo.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                        {isAck ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={11} />
                            <span>Acknowledged</span>
                          </span>
                        ) : needsAck ? (
                          <button
                            type="button"
                            onClick={() => acknowledgeMemo(memo.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={12} />
                            <span>Acknowledge</span>
                          </button>
                        ) : isRead ? (
                          <span className="text-[10px] text-slate-400 font-medium">Read</span>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-600">New</span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            markMemoAsRead(memo.id);
                            setDashboardMemoModal(memo);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Read</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

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
      {/* Quick Dashboard Memo Reader Modal */}
      {dashboardMemoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-scale-up">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-[#0B1A3F] to-[#0D52F8] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-white">
                  <Megaphone size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-200 font-bold">{dashboardMemoModal.memoNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMemoPriorityBadge(dashboardMemoModal.priority)}`}>
                      {dashboardMemoModal.priority.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold tracking-tight mt-0.5">
                    Official Management Memorandum
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDashboardMemoModal(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 text-xs">
              <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm tracking-tight text-slate-900 uppercase">
                    MODE DIGITAL CREATIONS / MODE WEB HOST
                  </h3>
                  <p className="text-[10px] text-slate-500">Corporate Management Memorandum</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getMemoCategoryBadge(dashboardMemoModal.category)}`}>
                  {dashboardMemoModal.category.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">MEMO REF:</span>
                  <span className="font-bold text-slate-900">{dashboardMemoModal.memoNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">DATE:</span>
                  <span className="text-slate-700">{formatDate(dashboardMemoModal.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">FROM:</span>
                  <span className="font-bold text-slate-900">{dashboardMemoModal.senderName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">DISTRIBUTION:</span>
                  <span className="text-slate-700 uppercase">
                    {dashboardMemoModal.targetAudience === 'all' ? 'ALL STAFF' : dashboardMemoModal.targetDepartment || 'DIRECT'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Subject Directive
                </span>
                <h4 className="text-base font-extrabold text-slate-900 leading-snug mt-0.5">
                  {dashboardMemoModal.title}
                </h4>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[140px]">
                {dashboardMemoModal.content}
              </div>

              {dashboardMemoModal.requiresAcknowledgment && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-blue-600" />
                      <span>Staff Acknowledgment Verification</span>
                    </span>
                    {dashboardMemoModal.acknowledgedBy[currentUser.id] ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} />
                        <span>Signed &amp; Confirmed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle size={12} />
                        <span>Action Required</span>
                      </span>
                    )}
                  </div>

                  {dashboardMemoModal.acknowledgedBy[currentUser.id] ? (
                    <div className="text-[11px] text-slate-500">
                      Acknowledged by <strong>{currentUser.full_name}</strong> on {new Date(dashboardMemoModal.acknowledgedBy[currentUser.id]).toLocaleString()}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <p className="text-[11px] text-slate-600">
                        Clicking acknowledge confirms you have received and read this directive.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          acknowledgeMemo(dashboardMemoModal.id);
                          setDashboardMemoModal({
                            ...dashboardMemoModal,
                            acknowledgedBy: {
                              ...dashboardMemoModal.acknowledgedBy,
                              [currentUser.id]: new Date().toISOString()
                            }
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                      >
                        <Check size={13} />
                        <span>Acknowledge Receipt</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDashboardMemoModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
