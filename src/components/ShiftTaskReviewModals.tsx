'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  CheckSquare,
  Square,
  Sparkles,
  LogOut,
  X,
  Layers,
  ChevronRight,
  Check
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { TaskPriority, ShiftTask } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ShiftTaskReviewModals() {
  const router = useRouter();
  const {
    currentUser,
    activeShift,
    clockInStaff,
    shiftTasks,
    addShiftTask,
    completeShiftReview,
    projects,
    shiftReviewModalOpen,
    setShiftReviewModalOpen,
    resumeShiftModalOpen,
    setResumeShiftModalOpen,
    logout
  } = useAppStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // ==========================================
  // RESUME SHIFT / SET WORK PLAN STATE
  // ==========================================
  const [newPlanTaskTitle, setNewPlanTaskTitle] = useState('');
  const [newPlanPriority, setNewPlanPriority] = useState<TaskPriority>('high');
  const [newPlanProjectId, setNewPlanProjectId] = useState('');
  const [queuedTasks, setQueuedTasks] = useState<Array<{ title: string; priority: TaskPriority; projectId?: string; projectName?: string }>>([]);

  // Pending tasks carried over from yesterday/earlier waiting for staff
  const pendingCarriedTasks = shiftTasks.filter(
    t => t.staffId === currentUser.id && t.status === 'pending' && (t.date < todayStr || t.carriedForwardFrom)
  );

  const handleQueueTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTaskTitle.trim()) return;
    const proj = projects.find(p => p.id === newPlanProjectId);
    setQueuedTasks(prev => [
      ...prev,
      {
        title: newPlanTaskTitle.trim(),
        priority: newPlanPriority,
        projectId: newPlanProjectId || undefined,
        projectName: proj?.name || undefined
      }
    ]);
    setNewPlanTaskTitle('');
  };

  const handleConfirmStartShift = () => {
    // 1. Clock in staff if not already active
    if (!activeShift) {
      clockInStaff(currentUser.id);
    }

    // 2. Add all queued tasks for today
    queuedTasks.forEach(task => {
      addShiftTask({
        staffId: currentUser.id,
        staffName: currentUser.full_name,
        date: todayStr,
        title: task.title,
        priority: task.priority,
        status: 'pending',
        projectId: task.projectId,
        projectName: task.projectName
      });
    });

    setQueuedTasks([]);
    setResumeShiftModalOpen(false);
  };

  // ==========================================
  // END OF SHIFT REVIEW STATE
  // ==========================================
  // Find all tasks for this staff member for today (or pending)
  const staffTodayTasks = shiftTasks.filter(
    t => t.staffId === currentUser.id && (t.date === todayStr || t.status === 'pending')
  );

  const [selectedCompletedIds, setSelectedCompletedIds] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');

  // Sync selectedCompletedIds whenever modal opens or tasks change
  useEffect(() => {
    if (shiftReviewModalOpen) {
      setSelectedCompletedIds(staffTodayTasks.filter(t => t.status === 'completed').map(t => t.id));
      setReviewNotes('');
    }
  }, [shiftReviewModalOpen]);

  const toggleTaskCompleted = (taskId: string) => {
    setSelectedCompletedIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const pendingRolloverTasks = staffTodayTasks.filter(t => !selectedCompletedIds.includes(t.id));

  const handleFinishShiftReview = () => {
    completeShiftReview({
      staffId: currentUser.id,
      shiftId: activeShift?.id,
      completedTaskIds: selectedCompletedIds,
      reviewNotes: reviewNotes.trim() || undefined
    });

    setShiftReviewModalOpen(false);
    router.push('/login');
  };

  const handleQuickClockOut = () => {
    logout();
    setShiftReviewModalOpen(false);
    router.push('/login');
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. RESUME SHIFT & SET TODAY'S WORK PLAN MODAL             */}
      {/* ======================================================== */}
      {resumeShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setResumeShiftModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Resume Shift &amp; Set Today&apos;s Checklist
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Plan your deliverables for today, {new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResumeShiftModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Staff Badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{currentUser.full_name}</span>
                  <div className="text-[11px] text-slate-500">{currentUser.job_title || currentUser.role.replace('_', ' ')} • {currentUser.department || 'Operations'}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  New Shift Session
                </span>
              </div>

              {/* Tasks Carried Forward from Previous Day */}
              {pendingCarriedTasks.length > 0 && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ArrowRight size={14} className="text-amber-600" />
                    <span>Tasks Carried Forward from Previous Day ({pendingCarriedTasks.length})</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-snug">
                    These items were pending at the end of your last shift and are automatically waiting in your work plan:
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {pendingCarriedTasks.map(task => (
                      <div key={task.id} className="p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-slate-800">{task.title}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-mono">
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Tasks Form */}
              <div className="space-y-2.5">
                <label className="block text-slate-800 font-bold text-xs">
                  What goals &amp; tasks do you plan to achieve today?
                </label>
                <form onSubmit={handleQueueTask} className="space-y-2">
                  <input
                    type="text"
                    value={newPlanTaskTitle}
                    onChange={e => setNewPlanTaskTitle(e.target.value)}
                    placeholder="e.g. Audit hosting accounts, disburse approved vouchers, follow up proposal..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={newPlanPriority}
                      onChange={e => setNewPlanPriority(e.target.value as TaskPriority)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700"
                    >
                      <option value="urgent">Urgent Priority</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>

                    <select
                      value={newPlanProjectId}
                      onChange={e => setNewPlanProjectId(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 flex-1 min-w-[140px]"
                    >
                      <option value="">General / Operations Task</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>Project: {p.name}</option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus size={13} />
                      <span>Add</span>
                    </button>
                  </div>
                </form>

                {/* Queued Tasks Preview */}
                {queuedTasks.length > 0 && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-blue-900">
                      Planned Today ({queuedTasks.length})
                    </div>
                    {queuedTasks.map((t, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-blue-200 flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-800 truncate">{t.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {t.projectName && (
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                              {t.projectName}
                            </span>
                          )}
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                            {t.priority.toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQueuedTasks(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResumeShiftModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStartShift}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 text-xs"
              >
                <CheckCircle2 size={14} />
                <span>Resume Shift &amp; Start Work Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. END OF SHIFT REVIEW & TASK ROLLOVER MODAL              */}
      {/* ======================================================== */}
      {shiftReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setShiftReviewModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    End of Shift Task Review &amp; Handover
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Check off tasks accomplished today. Pending tasks will automatically roll forward to tomorrow.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShiftReviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Shift Stats Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{currentUser.full_name}</div>
                  <div className="text-[11px] text-slate-500">
                    Shift Clock-in: {activeShift ? new Date(activeShift.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active Today'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {selectedCompletedIds.length} of {staffTodayTasks.length} Accomplished
                  </span>
                </div>
              </div>

              {/* Task Checklist for Review */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                    Today&apos;s Task Checklist
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Tick tasks completed today
                  </span>
                </div>

                {staffTodayTasks.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-500 text-xs">
                    No specific tasks were logged for today&apos;s shift session.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {staffTodayTasks.map(task => {
                      const isChecked = selectedCompletedIds.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTaskCompleted(task.id)}
                          className={`p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <Check size={11} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-mono ${
                                task.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                                task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {task.priority}
                              </span>
                              {task.projectName && (
                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                                  {task.projectName}
                                </span>
                              )}
                              {task.carriedForwardFrom && (
                                <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-medium">
                                  Carried forward
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Automatic Rollover Notice */}
              {pendingRolloverTasks.length > 0 && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <ArrowRight size={14} className="text-blue-600" />
                    <span>Automatic Next-Day Rollover ({pendingRolloverTasks.length} pending)</span>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-snug">
                    The {pendingRolloverTasks.length} uncompleted {pendingRolloverTasks.length === 1 ? 'task' : 'tasks'} above will automatically be carried forward to your next work plan ({tomorrowStr}) so nothing slips through the cracks.
                  </p>
                </div>
              )}

              {/* Shift Handover Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Shift Handover &amp; Summary Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Key accomplishments, items to follow up, or notes for the next shift..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleQuickClockOut}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Skip review and clock out
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShiftReviewModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition cursor-pointer"
                >
                  Keep Working
                </button>
                <button
                  type="button"
                  onClick={handleFinishShiftReview}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 text-xs"
                >
                  <LogOut size={13} />
                  <span>Check Off, Move Pending &amp; Clock Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
