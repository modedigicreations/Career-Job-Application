'use client';

import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  ChevronRight,
  Send,
  AlertCircle,
  ThumbsUp,
  User,
  Filter,
  Edit3,
  Trash2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Goal, GoalStatus } from '@/lib/types';
import { formatDate, canAssignTo, isManagementUser, isSuperAdminUser } from '@/lib/utils';

export default function GoalsPage() {
  const {
    goals,
    addGoal,
    updateGoalProgress,
    updateGoal,
    deleteGoal,
    submitGoalStrategy,
    approveGoalStrategy,
    requestGoalStrategyRevision,
    addFeedback,
    users,
    currentUser
  } = useAppStore();

  // A personal 1-Minute Goal is always yours alone unless you're a department head/admin
  // setting one for a direct report (or super-admin, for anyone) — the OMM Goals page is
  // the only place a goal can be created at all, so this is the entire assignment surface.
  const assignableUsers = users.filter(u => u.id === currentUser.id || canAssignTo(currentUser, u));
  const canAssignOthers = isManagementUser(currentUser.role) && assignableUsers.length > 1;

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newGoalModalOpen, setNewGoalModalOpen] = useState(false);
  const [selectedGoalForStrategy, setSelectedGoalForStrategy] = useState<Goal | null>(null);
  const [praiseModalGoal, setPraiseModalGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Only the goal's own creator (manager_id) or a super-admin can edit/delete it — the
  // employee it's assigned to can still move the progress slider, that's unrestricted.
  const canEditGoal = (goal: Goal) => goal.manager_id === currentUser.id || isSuperAdminUser(currentUser.role);

  const [editObjective, setEditObjective] = useState('');
  const [editExpectedResult, setEditExpectedResult] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  const openEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setEditObjective(goal.objective);
    setEditExpectedResult(goal.expected_result);
    setEditDeadline(goal.deadline);
  };

  const handleEditGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !editObjective.trim() || !editExpectedResult.trim()) return;
    updateGoal(editingGoal.id, { objective: editObjective, expected_result: editExpectedResult, deadline: editDeadline });
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goal: Goal) => {
    if (confirm(`Delete the 1-Minute Goal "${goal.objective}"?`)) {
      deleteGoal(goal.id);
    }
  };

  // Form State
  const [objective, setObjective] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [deadline, setDeadline] = useState('2026-10-30');
  const [employeeId, setEmployeeId] = useState(currentUser.id);

  // Strategy Input State
  const [strategyInput, setStrategyInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Praise State
  const [praiseText, setPraiseText] = useState('');

  const filteredGoals = goals.filter(g => {
    if (filterStatus !== 'all' && g.status !== filterStatus) return false;
    return true;
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim() || !expectedResult.trim()) return;

    // Defensive re-check even though the dropdown is already restricted — a personal goal
    // can only be set for yourself unless you're actually allowed to assign to that person.
    const targetId = assignableUsers.some(u => u.id === employeeId) ? employeeId : currentUser.id;
    const emp = users.find(u => u.id === targetId);

    addGoal({
      manager_id: currentUser.id,
      manager_name: currentUser.full_name,
      employee_id: targetId,
      employee_name: emp ? emp.full_name : 'Team Member',
      objective,
      expected_result: expectedResult,
      deadline,
    });

    setObjective('');
    setExpectedResult('');
    setNewGoalModalOpen(false);
  };

  const handleSendPraise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!praiseModalGoal || !praiseText.trim()) return;

    addFeedback({
      goal_id: praiseModalGoal.id,
      manager_id: currentUser.id,
      manager_name: currentUser.full_name,
      employee_id: praiseModalGoal.employee_id,
      employee_name: praiseModalGoal.employee_name || 'Team Member',
      type: 'praise',
      details: praiseText,
    });

    setPraiseModalGoal(null);
    setPraiseText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              One-Minute Goals & Strategy
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Ken Blanchard Leadership
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Agree on goals in 1 minute, review 250-word strategies, and celebrate milestone progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setEmployeeId(currentUser.id); setNewGoalModalOpen(true); }}
          className="px-4 py-2 rounded-xl bg-mode-royal hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Set 1-Minute Goal</span>
        </button>
      </div>

      {/* Goal Status Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'in_progress', 'completed', 'not_started'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition shrink-0 ${
                filterStatus === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium shrink-0">
          Showing {filteredGoals.length} Goals
        </span>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map(goal => (
          <div
            key={goal.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4"
          >
            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  goal.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {goal.status.replace('_', ' ').toUpperCase()}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {goal.objective}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-mono font-black text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  {goal.progress}%
                </span>
                {canEditGoal(goal) && (
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => openEditGoal(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-mode-royal hover:bg-blue-50 transition"
                      title="Edit Goal"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Goal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Expected Result */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expected Result:</span>
              <p className="text-slate-700 leading-relaxed">{goal.expected_result}</p>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Milestone Progress</span>
                <span>Due {formatDate(goal.deadline)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={e => updateGoalProgress(goal.id, parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-mode-royal"
              />
            </div>

            {/* People & Strategy */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                  {goal.employee_name ? goal.employee_name[0] : 'U'}
                </div>
                <span className="text-slate-700 font-medium">{goal.employee_name}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Two-Way Strategy Button */}
                <button
                  type="button"
                  onClick={() => setSelectedGoalForStrategy(goal)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                >
                  <MessageSquare size={13} />
                  <span>Strategy ({goal.strategy_status.replace('_', ' ')})</span>
                </button>

                {/* 1-Minute Praise Button */}
                <button
                  type="button"
                  onClick={() => setPraiseModalGoal(goal)}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs flex items-center gap-1 transition"
                  title="Give One-Minute Praise"
                >
                  <Sparkles size={13} />
                  <span>Praise</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Goal Modal */}
      {newGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setNewGoalModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
            <h2 className="text-base font-bold text-slate-900 mb-1">Set 1-Minute Goal</h2>
            <p className="text-xs text-slate-500 mb-4">Clear objectives that can be reviewed in less than 60 seconds.</p>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Goal Objective *</label>
                <input
                  type="text"
                  required
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="e.g. Close 5 New E-commerce Client Contracts"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expected Measurable Result *</label>
                <textarea
                  rows={3}
                  required
                  value={expectedResult}
                  onChange={e => setExpectedResult(e.target.value)}
                  placeholder="e.g. Minimum ₦10,000,000 contracted value signed before Q3 ends"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {canAssignOthers ? 'Assign To Team Member' : 'For'}
                  </label>
                  {canAssignOthers ? (
                    <select
                      value={employeeId}
                      onChange={e => setEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value={currentUser.id}>Me ({currentUser.job_title})</option>
                      {assignableUsers.filter(u => u.id !== currentUser.id).map(u => (
                        <option key={u.id} value={u.id}>{u.full_name} ({u.job_title})</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      disabled
                      value={`Me (${currentUser.job_title || currentUser.full_name})`}
                      className="w-full px-3 py-2 border border-slate-100 rounded-lg text-xs bg-slate-50 text-slate-400"
                      title="Personal goals are self-only — only a department head can set a goal for someone else"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewGoalModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mode-royal hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingGoal(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
            <h2 className="text-base font-bold text-slate-900 mb-1">Edit 1-Minute Goal</h2>
            <p className="text-xs text-slate-500 mb-4">Update the objective, expected result, or deadline.</p>

            <form onSubmit={handleEditGoalSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Goal Objective *</label>
                <input
                  type="text"
                  required
                  value={editObjective}
                  onChange={e => setEditObjective(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expected Measurable Result *</label>
                <textarea
                  rows={3}
                  required
                  value={editExpectedResult}
                  onChange={e => setEditExpectedResult(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={e => setEditDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mode-royal hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Strategy Iteration Modal */}
      {selectedGoalForStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedGoalForStrategy(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10">
            <h2 className="text-base font-bold text-slate-900 mb-1">1-Minute Strategy Alignment</h2>
            <div className="p-3 bg-slate-50 rounded-xl my-2 text-xs border border-slate-200">
              <span className="font-bold text-slate-900">{selectedGoalForStrategy.objective}</span>
              <p className="text-slate-500 mt-0.5">{selectedGoalForStrategy.expected_result}</p>
            </div>

            {/* Current Strategy Thread */}
            <div className="space-y-3 my-4 max-h-60 overflow-y-auto">
              {selectedGoalForStrategy.strategy_text ? (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-blue-800 font-bold">
                    <span>Employee Action Plan:</span>
                    <span className="text-[10px] uppercase font-mono">{selectedGoalForStrategy.strategy_status}</span>
                  </div>
                  <p className="whitespace-pre-line text-slate-800">{selectedGoalForStrategy.strategy_text}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No strategy submitted yet by team member.</p>
              )}

              {selectedGoalForStrategy.strategy_feedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-800">Manager Coaching Feedback:</span>
                  <p className="text-slate-800">{selectedGoalForStrategy.strategy_feedback}</p>
                </div>
              )}
            </div>

            {/* Interaction controls */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Submit / Co-Edit 1-Minute Strategy Plan:</label>
                <textarea
                  rows={3}
                  value={strategyInput}
                  onChange={e => setStrategyInput(e.target.value)}
                  placeholder="Outline key actions to achieve this goal..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (strategyInput) submitGoalStrategy(selectedGoalForStrategy.id, strategyInput);
                    setSelectedGoalForStrategy(null);
                  }}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition"
                >
                  Submit Strategy
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      approveGoalStrategy(selectedGoalForStrategy.id, 'Approved by Manager. Excellent focus!');
                      setSelectedGoalForStrategy(null);
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                  >
                    Approve Strategy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Praise Modal */}
      {praiseModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPraiseModalGoal(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs">
            <div className="flex items-center gap-2 text-purple-600 font-bold mb-1">
              <Sparkles size={16} />
              <h2 className="text-base font-bold text-slate-900">Send One-Minute Praise 🎉</h2>
            </div>
            <p className="text-slate-500 mb-3">Catch {praiseModalGoal.employee_name} doing something right immediately!</p>

            <form onSubmit={handleSendPraise} className="space-y-3">
              <textarea
                rows={4}
                required
                value={praiseText}
                onChange={e => setPraiseText(e.target.value)}
                placeholder="Describe specifically what they did right and how it helps MODE Digital..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPraiseModalGoal(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                >
                  Deliver Praise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
