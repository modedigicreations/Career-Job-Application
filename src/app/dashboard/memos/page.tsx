'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Megaphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  X,
  Eye,
  Check,
  Send,
  Building2,
  Users,
  ShieldCheck,
  FileText,
  Trash2,
  ChevronRight,
  ArrowRight,
  Info,
  Calendar,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDate, isManagementUser, getMemoPriorityBadge, getMemoCategoryBadge } from '@/lib/utils';
import type { StaffMemo, MemoPriority, MemoCategory, MemoTargetAudience } from '@/lib/types';

function MemosContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');
  const memoQueryId = searchParams.get('id');

  const {
    currentUser,
    users,
    memos,
    sendMemo,
    markMemoAsRead,
    acknowledgeMemo,
    deleteMemo
  } = useAppStore();

  const isManager = isManagementUser(currentUser.role);

  // Active Tab: 'inbox' | 'management'
  const [activeTab, setActiveTab] = useState<'inbox' | 'management'>('inbox');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'urgent' | 'policy' | 'acknowledged'>('all');

  // Selected Memo for full letterhead modal reading
  const [selectedMemo, setSelectedMemo] = useState<StaffMemo | null>(() => {
    if (memoQueryId) {
      return memos.find(m => m.id === memoQueryId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (memoQueryId && memos.length > 0) {
      const found = memos.find(m => m.id === memoQueryId);
      if (found) {
        setSelectedMemo(found);
        markMemoAsRead(found.id);
      }
    }
  }, [memoQueryId, memos]);

  // Track delivery detail modal (for management)
  const [trackingMemo, setTrackingMemo] = useState<StaffMemo | null>(null);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(initialAction === 'create' && isManager);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [composePriority, setComposePriority] = useState<MemoPriority>('normal');
  const [composeCategory, setComposeCategory] = useState<MemoCategory>('operations');
  const [composeTargetAudience, setComposeTargetAudience] = useState<MemoTargetAudience>('all');
  const [composeTargetDepartment, setComposeTargetDepartment] = useState('Engineering');
  const [composeTargetStaffIds, setComposeTargetStaffIds] = useState<string[]>([]);
  const [composeRequireAck, setComposeRequireAck] = useState(true);
  const [composePreview, setComposePreview] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Departments list from staff
  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [users]);

  // Memos relevant to the current user
  const receivedMemos = useMemo(() => {
    return memos.filter(m => {
      // Creator can always view
      if (m.senderId === currentUser.id) return true;
      if (m.targetAudience === 'all') return true;
      if (m.targetAudience === 'department' && m.targetDepartment?.toLowerCase() === currentUser.department?.toLowerCase()) {
        return true;
      }
      if (m.targetAudience === 'specific_staff' && m.targetStaffIds?.includes(currentUser.id)) {
        return true;
      }
      // If management, allow auditing all memos
      if (isManager) return true;
      return false;
    });
  }, [memos, currentUser, isManager]);

  // Memos sent by management
  const sentMemos = useMemo(() => {
    return memos.filter(m => m.senderId === currentUser.id || isManager);
  }, [memos, currentUser, isManager]);

  // Filtered inbox memos
  const filteredInboxMemos = useMemo(() => {
    return receivedMemos.filter(m => {
      // Search
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.memoNumber.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Filter pills
      const isRead = !!m.readBy[currentUser.id];
      const isAck = !!m.acknowledgedBy[currentUser.id];

      if (selectedFilter === 'unread') return !isRead;
      if (selectedFilter === 'urgent') return m.priority === 'urgent';
      if (selectedFilter === 'policy') return m.priority === 'policy' || m.category === 'policy';
      if (selectedFilter === 'acknowledged') return isAck;

      return true;
    });
  }, [receivedMemos, searchQuery, selectedFilter, currentUser.id]);

  // Unread count for current user
  const unreadCount = useMemo(() => {
    return receivedMemos.filter(m => !m.readBy[currentUser.id]).length;
  }, [receivedMemos, currentUser.id]);

  const pendingAckCount = useMemo(() => {
    return receivedMemos.filter(m => m.requiresAcknowledgment && !m.acknowledgedBy[currentUser.id]).length;
  }, [receivedMemos, currentUser.id]);

  // Handlers
  const handleOpenMemo = (memo: StaffMemo) => {
    markMemoAsRead(memo.id);
    setSelectedMemo(memo);
  };

  const handleAcknowledge = (memoId: string) => {
    acknowledgeMemo(memoId);
    if (selectedMemo && selectedMemo.id === memoId) {
      setSelectedMemo({
        ...selectedMemo,
        acknowledgedBy: {
          ...selectedMemo.acknowledgedBy,
          [currentUser.id]: new Date().toISOString()
        },
        readBy: {
          ...selectedMemo.readBy,
          [currentUser.id]: selectedMemo.readBy[currentUser.id] || new Date().toISOString()
        }
      });
    }
  };

  const handleCreateMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeContent.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please fill in both title and memo content.' });
      return;
    }

    const res = sendMemo({
      title: composeTitle,
      content: composeContent,
      priority: composePriority,
      category: composeCategory,
      targetAudience: composeTargetAudience,
      targetDepartment: composeTargetAudience === 'department' ? composeTargetDepartment : undefined,
      targetStaffIds: composeTargetAudience === 'specific_staff' ? composeTargetStaffIds : undefined,
      requiresAcknowledgment: composeRequireAck
    });

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setComposeTitle('');
      setComposeContent('');
      setComposePriority('normal');
      setComposeCategory('operations');
      setComposeTargetAudience('all');
      setComposeTargetStaffIds([]);
      setIsComposeOpen(false);
      setComposePreview(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const toggleStaffSelection = (staffId: string) => {
    setComposeTargetStaffIds(prev =>
      prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0B111E] via-[#0f245c] to-mode-royal text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
                <Megaphone size={12} className="text-blue-300" />
                <span>Executive Circular &amp; Staff Memo Hub</span>
              </span>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                  {unreadCount} Unread Directive{unreadCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Internal Management Directives
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-2xl">
              Official company-wide policies, operational announcements, and executive directives from management with verified digital receipt &amp; staff acknowledgments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {isManager && (
              <button
                type="button"
                onClick={() => setIsComposeOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus size={15} className="text-blue-600" />
                <span>Issue New Memo</span>
              </button>
            )}
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition border border-white/20 flex items-center gap-1.5"
            >
              <span>Back to Cockpit</span>
            </Link>
          </div>
        </div>

        {/* Ambient Blur */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Success / Error Notification Alert */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Memos */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Memos Received</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Megaphone size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {receivedMemos.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Active directives in your record
          </div>
        </div>

        {/* Unread Memos */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Unread Memos</span>
            <div className={`p-2 rounded-lg ${unreadCount > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {unreadCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {unreadCount > 0 ? 'Pending your review' : 'All caught up'}
          </div>
        </div>

        {/* Pending Acknowledgment */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Requires Sign-off</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {pendingAckCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Mandatory acknowledgment needed
          </div>
        </div>

        {/* Management Stats / Total Staff */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Company Staff</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {users.length} Members
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Across {departments.length} departments
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Megaphone size={14} />
            <span>Staff Memo Inbox</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>

          {isManager && (
            <button
              type="button"
              onClick={() => setActiveTab('management')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'management'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 size={14} />
              <span>Executive Broadcasts &amp; Tracker ({sentMemos.length})</span>
            </button>
          )}
        </div>

        {activeTab === 'inbox' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search memos..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              {(['all', 'unread', 'urgent', 'policy', 'acknowledged'] as const).map(filter => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`capitalize px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                    selectedFilter === filter
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: INBOX VIEW (For All Staff Members)                */}
      {/* ======================================================== */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {filteredInboxMemos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Memos Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {searchQuery || selectedFilter !== 'all'
                  ? 'No directives match your current search and filter settings.'
                  : 'You have no internal management directives at this time.'}
              </p>
              {(searchQuery || selectedFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                  }}
                  className="mt-3 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInboxMemos.map(memo => {
                const isRead = !!memo.readBy[currentUser.id];
                const isAck = !!memo.acknowledgedBy[currentUser.id];
                const needsAck = memo.requiresAcknowledgment && !isAck;

                return (
                  <div
                    key={memo.id}
                    className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md bg-white ${
                      !isRead
                        ? 'border-blue-400/80 ring-2 ring-blue-500/10'
                        : needsAck
                        ? 'border-amber-300'
                        : 'border-slate-200/80'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {memo.memoNumber}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMemoPriorityBadge(memo.priority)}`}>
                            {memo.priority.toUpperCase()}
                          </span>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" title="Unread" />
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => handleOpenMemo(memo)}
                        className="text-sm font-bold text-slate-900 leading-snug hover:text-blue-600 cursor-pointer line-clamp-2"
                      >
                        {memo.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {memo.content}
                      </p>

                      {/* Sender & Target Information */}
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">
                            From: {memo.senderName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(memo.createdAt)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          To:{' '}
                          {memo.targetAudience === 'all'
                            ? 'All Company Staff'
                            : memo.targetAudience === 'department'
                            ? `${memo.targetDepartment} Dept`
                            : 'Direct Recipient'}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        {isAck ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={11} />
                            <span>Acknowledged</span>
                          </span>
                        ) : needsAck ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle size={11} />
                            <span>Sign-off Required</span>
                          </span>
                        ) : isRead ? (
                          <span className="text-[10px] font-medium text-slate-400">
                            Read
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-600">
                            New Directive
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {needsAck && (
                          <button
                            type="button"
                            onClick={() => handleAcknowledge(memo.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={12} />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenMemo(memo)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MANAGEMENT BROADCAST HUB & AUDIT TRACKER         */}
      {/* ======================================================== */}
      {activeTab === 'management' && isManager && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official Sent Memos &amp; Delivery Tracking
              </h2>
              <p className="text-xs text-slate-500">
                Audit delivery status, staff read receipts, and digital signature acknowledgments across all issued company directives.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsComposeOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-mode-royal hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Draft New Memo</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ref &amp; Date</th>
                    <th className="py-3 px-4">Directive Title</th>
                    <th className="py-3 px-4">Target Audience</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4 text-center">Read Rate</th>
                    <th className="py-3 px-4 text-center">Acknowledgment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sentMemos.map(memo => {
                    // Compute audience size
                    const targetUsers = users.filter(u => {
                      if (memo.targetAudience === 'all') return true;
                      if (memo.targetAudience === 'department' && memo.targetDepartment) {
                        return u.department?.toLowerCase() === memo.targetDepartment.toLowerCase();
                      }
                      if (memo.targetAudience === 'specific_staff' && memo.targetStaffIds) {
                        return memo.targetStaffIds.includes(u.id);
                      }
                      return true;
                    });

                    const totalRecipients = targetUsers.length || 1;
                    const readCount = Object.keys(memo.readBy).length;
                    const ackCount = Object.keys(memo.acknowledgedBy).length;

                    const readPercent = Math.min(100, Math.round((readCount / totalRecipients) * 100));
                    const ackPercent = Math.min(100, Math.round((ackCount / totalRecipients) * 100));

                    return (
                      <tr key={memo.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-800">{memo.memoNumber}</div>
                          <div className="text-[10px] text-slate-400">{formatDate(memo.createdAt)}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 line-clamp-1">{memo.title}</div>
                          <div className="text-[10px] text-slate-400">By {memo.senderName} ({memo.senderRole})</div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {memo.targetAudience === 'all'
                              ? `All Staff (${totalRecipients})`
                              : memo.targetAudience === 'department'
                              ? `${memo.targetDepartment} (${totalRecipients})`
                              : `Specific (${totalRecipients})`}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMemoPriorityBadge(memo.priority)}`}>
                            {memo.priority.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-800 text-[11px]">{readCount}/{totalRecipients} ({readPercent}%)</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${readPercent}%` }} />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {memo.requiresAcknowledgment ? (
                            <div className="flex flex-col items-center">
                              <span className={`font-bold text-[11px] ${ackPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {ackCount}/{totalRecipients} ({ackPercent}%)
                              </span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                <div className={`h-full rounded-full ${ackPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${ackPercent}%` }} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Not Required</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setTrackingMemo(memo)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold transition cursor-pointer"
                              title="Audit Staff Delivery"
                            >
                              Staff Audit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenMemo(memo)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              title="View Memo"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to retract memo "${memo.title}"?`)) {
                                  deleteMemo(memo.id);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Retract / Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPOSE NEW MEMO MODAL (Management Only)                 */}
      {/* ======================================================== */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-scale-up">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-[#0D214F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                    Issue Management Directive / Staff Memo
                  </h2>
                  <p className="text-[11px] text-blue-200">
                    Official circular will be delivered directly to staff dashboard &amp; notification feed.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Switch between Editor & Preview */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setComposePreview(false)}
                className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                  !composePreview
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Memo Details &amp; Target
              </button>
              <button
                type="button"
                onClick={() => setComposePreview(true)}
                className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                  composePreview
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Live Official Letterhead Preview
              </button>
            </div>

            {/* Modal Body */}
            {!composePreview ? (
              <form onSubmit={handleCreateMemo} className="p-5 space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Directive / Memo Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={composeTitle}
                    onChange={e => setComposeTitle(e.target.value)}
                    placeholder="e.g. Q4 All-Hands Operational Strategy &amp; Attendance Policy"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Priority & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Directive Priority
                    </label>
                    <select
                      value={composePriority}
                      onChange={e => setComposePriority(e.target.value as MemoPriority)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                    >
                      <option value="normal">Normal Information</option>
                      <option value="announcement">Executive Announcement</option>
                      <option value="policy">Policy Directive</option>
                      <option value="urgent">🚨 URGENT Action Required</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Category
                    </label>
                    <select
                      value={composeCategory}
                      onChange={e => setComposeCategory(e.target.value as MemoCategory)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                    >
                      <option value="operations">Operations &amp; Delivery</option>
                      <option value="policy">Corporate Policy</option>
                      <option value="urgent_notice">Urgent Notice</option>
                      <option value="event">Corporate Event / Schedule</option>
                      <option value="general">General Directive</option>
                    </select>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Target Distribution Audience</span>
                    <span className="text-[11px] text-slate-500">Who should receive this memo?</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'All Staff' },
                      { id: 'department', label: 'Department' },
                      { id: 'specific_staff', label: 'Specific Staff' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setComposeTargetAudience(opt.id as MemoTargetAudience)}
                        className={`py-2 px-2 rounded-lg font-bold text-xs border text-center transition cursor-pointer ${
                          composeTargetAudience === opt.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {composeTargetAudience === 'department' && (
                    <div className="mt-2">
                      <label className="block text-slate-600 font-semibold mb-1 text-[11px]">
                        Select Target Department:
                      </label>
                      <select
                        value={composeTargetDepartment}
                        onChange={e => setComposeTargetDepartment(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {composeTargetAudience === 'specific_staff' && (
                    <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      <label className="block text-slate-600 font-semibold text-[11px]">
                        Select Specific Team Members:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {users.map(u => (
                          <label
                            key={u.id}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer transition ${
                              composeTargetStaffIds.includes(u.id)
                                ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={composeTargetStaffIds.includes(u.id)}
                              onChange={() => toggleStaffSelection(u.id)}
                              className="rounded text-blue-600"
                            />
                            <span className="truncate">{u.full_name} ({u.job_title || u.role})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Official Memo Body &amp; Instructions *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={composeContent}
                    onChange={e => setComposeContent(e.target.value)}
                    placeholder="Enter the complete directives, bullet points, deadlines, or expectations..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Require Acknowledgment Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs">
                      Require Mandatory Staff Acknowledgment
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Staff must click &quot;Acknowledge &amp; Confirm Receipt&quot; to verify they have reviewed this directive.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={composeRequireAck}
                      onChange={e => setComposeRequireAck(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposePreview(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition cursor-pointer"
                  >
                    Preview Memo
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Broadcast Now</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Preview Tab */
              <div className="p-6 space-y-5">
                {/* Official Letterhead Preview */}
                <div className="border border-slate-300 rounded-2xl p-6 bg-white shadow-xs relative">
                  {/* Top Letterhead */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                          M
                        </div>
                        <div>
                          <div className="font-black text-sm tracking-tight text-slate-900">
                            MODE DIGITAL CREATIONS / MODE WEB HOST
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Internal Executive Management Memorandum
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMemoPriorityBadge(composePriority)}`}>
                        {composePriority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Matrix */}
                  <div className="grid grid-cols-2 gap-3 text-xs pb-4 border-b border-slate-200 mb-4 font-mono">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">TO:</span>
                      <span className="font-bold text-slate-800">
                        {composeTargetAudience === 'all'
                          ? 'ALL COMPANY STAFF'
                          : composeTargetAudience === 'department'
                          ? `${composeTargetDepartment.toUpperCase()} DEPARTMENT`
                          : `${composeTargetStaffIds.length} SPECIFIED STAFF MEMBERS`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">FROM:</span>
                      <span className="font-bold text-slate-800">
                        {currentUser.full_name} ({currentUser.job_title || currentUser.role})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">DATE:</span>
                      <span className="text-slate-700">{formatDate(new Date().toISOString())}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">REF:</span>
                      <span className="text-slate-700 font-bold">MEMO-2026-PREVIEW</span>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 font-mono block">SUBJECT:</span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                      {composeTitle || 'Untitled Directive'}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[120px]">
                    {composeContent || 'No memo content provided yet.'}
                  </div>

                  {/* Sign-off Seal Notice */}
                  {composeRequireAck && (
                    <div className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                      <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                      <span>Staff recipients will be prompted to submit a verified acknowledgment seal.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setComposePreview(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                  >
                    &larr; Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateMemo}
                    className="px-5 py-2 rounded-xl bg-mode-royal hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Confirm &amp; Broadcast to Staff</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DETAILED MEMO LETTERHEAD VIEW MODAL                      */}
      {/* ======================================================== */}
      {selectedMemo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-[#0B1A3F] to-mode-royal text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-white">
                  <Megaphone size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-200 font-bold">{selectedMemo.memoNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMemoPriorityBadge(selectedMemo.priority)}`}>
                      {selectedMemo.priority.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold tracking-tight mt-0.5">
                    Official Management Memorandum
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemo(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Letterhead Body */}
            <div className="p-5 sm:p-7 space-y-6 text-xs">
              {/* Formal Company Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mode-royal text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                    M
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight text-slate-900 uppercase">
                      MODE DIGITAL CREATIONS / MODE WEB HOST
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Corporate Operations &amp; Executive Directives
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getMemoCategoryBadge(selectedMemo.category)}`}>
                    {selectedMemo.category.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Memo Meta Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">MEMO REF:</span>
                  <span className="font-bold text-slate-900">{selectedMemo.memoNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">DATE ISSUED:</span>
                  <span className="text-slate-700">{formatDate(selectedMemo.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">ISSUED BY:</span>
                  <span className="font-bold text-slate-900">{selectedMemo.senderName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">DISTRIBUTION:</span>
                  <span className="text-slate-700 uppercase">
                    {selectedMemo.targetAudience === 'all'
                      ? 'ALL STAFF'
                      : selectedMemo.targetAudience === 'department'
                      ? `${selectedMemo.targetDepartment} DEPT`
                      : 'DIRECT'}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Subject Directive
                </span>
                <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                  {selectedMemo.title}
                </h4>
              </div>

              {/* Full Content */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[160px]">
                {selectedMemo.content}
              </div>

              {/* Acknowledgment Status Section */}
              {selectedMemo.requiresAcknowledgment && (
                <div className="p-4 rounded-2xl border bg-slate-50/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-blue-600" />
                      <span>Official Staff Sign-off &amp; Acknowledgment</span>
                    </span>

                    {selectedMemo.acknowledgedBy[currentUser.id] ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 size={13} />
                        <span>Signed &amp; Acknowledged</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <AlertTriangle size={13} />
                        <span>Action Required</span>
                      </span>
                    )}
                  </div>

                  {selectedMemo.acknowledgedBy[currentUser.id] ? (
                    <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span>Digital acknowledgment recorded for </span>
                        <strong className="text-slate-800">{currentUser.full_name}</strong>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(selectedMemo.acknowledgedBy[currentUser.id]).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-[11px] text-amber-900">
                        By clicking acknowledge, you confirm that you have read, understood, and agreed to adhere to this management directive.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(selectedMemo.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Acknowledge Receipt</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Management Tracking Summary inside modal */}
              {isManager && (
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">Management Delivery Record: </span>
                    <span className="text-slate-600">
                      {Object.keys(selectedMemo.readBy).length} staff read • {Object.keys(selectedMemo.acknowledgedBy).length} staff acknowledged
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingMemo(selectedMemo);
                      setSelectedMemo(null);
                    }}
                    className="text-blue-700 font-bold hover:underline cursor-pointer"
                  >
                    View Roster Audit &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedMemo(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                Close Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STAFF DELIVERY AUDIT ROSTER MODAL (Management)           */}
      {/* ======================================================== */}
      {trackingMemo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-scale-up">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-blue-300 font-bold">{trackingMemo.memoNumber}</span>
                  <span className="text-xs text-slate-400">• Staff Delivery Audit</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
                  {trackingMemo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingMemo(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between text-slate-600 pb-2 border-b border-slate-100 font-bold text-[11px]">
                <span>Staff Member &amp; Department</span>
                <span>Delivery &amp; Sign-off Status</span>
              </div>

              <div className="divide-y divide-slate-100">
                {users.map(u => {
                  const hasRead = !!trackingMemo.readBy[u.id];
                  const hasAck = !!trackingMemo.acknowledgedBy[u.id];
                  const readTime = trackingMemo.readBy[u.id];
                  const ackTime = trackingMemo.acknowledgedBy[u.id];

                  return (
                    <div key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{u.full_name}</span>
                          {u.id === trackingMemo.senderId && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                              Author
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {u.job_title || u.role} • {u.department || 'Operations'}
                        </div>
                      </div>

                      <div className="text-right">
                        {hasAck ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={11} />
                              <span>Acknowledged</span>
                            </span>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {ackTime ? new Date(ackTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                        ) : hasRead ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              <Eye size={11} />
                              <span>Read (Pending Sign-off)</span>
                            </span>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {readTime ? new Date(readTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <Clock size={11} />
                            <span>Unread</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setTrackingMemo(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffMemosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Staff Memos...</div>}>
      <MemosContent />
    </Suspense>
  );
}
