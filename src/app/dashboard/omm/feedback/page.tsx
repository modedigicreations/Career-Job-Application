'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  Plus,
  ThumbsUp,
  AlertCircle,
  User,
  HeartHandshake
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Feedback } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function FeedbackPage() {
  const { feedbacks, addFeedback, users, currentUser } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<'praise' | 'redirect'>('praise');
  const [employeeId, setEmployeeId] = useState('u2');
  const [details, setDetails] = useState('');

  const handleCreateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    const emp = users.find(u => u.id === employeeId);

    addFeedback({
      manager_id: currentUser.id,
      manager_name: currentUser.full_name,
      employee_id: employeeId,
      employee_name: emp ? emp.full_name : 'Staff Member',
      type,
      details,
    });

    setDetails('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              One-Minute Praisings & Redirects
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
              Immediate Coaching
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catch team members doing things right in 60 seconds, or redirect behaviors immediately with respect.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Sparkles size={15} />
          <span>Deliver Feedback</span>
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-4 max-w-3xl">
        {feedbacks.map(fb => {
          const isPraise = fb.type === 'praise';
          return (
            <div
              key={fb.id}
              className={`p-5 rounded-2xl border shadow-xs space-y-3 ${
                isPraise
                  ? 'bg-gradient-to-r from-purple-50/50 to-white border-purple-200/80'
                  : 'bg-gradient-to-r from-amber-50/50 to-white border-amber-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isPraise ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isPraise ? <ThumbsUp size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isPraise ? 'text-purple-700' : 'text-amber-700'}`}>
                    {isPraise ? 'One-Minute Praise' : 'One-Minute Redirect'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{formatDate(fb.created_at)}</span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {fb.details}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Delivered to: {fb.employee_name}</span>
                <span>By: {fb.manager_name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Send One-Minute Feedback</h2>
            <form onSubmit={handleCreateFeedback} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Feedback Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('praise')}
                    className={`p-2 rounded-lg border font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'praise' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <ThumbsUp size={14} />
                    <span>Praise 🎉</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('redirect')}
                    className={`p-2 rounded-lg border font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      type === 'redirect' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <AlertCircle size={14} />
                    <span>Redirect 🎯</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Recipient Team Member</label>
                <select
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.job_title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {type === 'praise' ? 'What specific behavior are you praising?' : 'What specific action needs redirection?'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="State the behavior clearly and explain why it matters..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                >
                  Deliver Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
