'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Clock,
  CheckSquare,
  Square,
  User,
  Calendar,
  Layers,
  ChevronRight,
  Edit3,
  Trash2,
  X,
  Check,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Filter,
  ListTodo,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type {
  Project,
  Task,
  ServiceType,
  ProjectStatus,
  TaskPriority,
  Currency,
  TaskStatus,
  ShiftTask
} from '@/lib/types';
import { formatCurrency, formatDate, getProjectStatusBadge, canAssignTo, isManagementUser } from '@/lib/utils';

export default function ProjectsPage() {
  const {
    projects,
    tasks,
    users,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    addProject,
    updateProject,
    deleteProject,
    shiftTasks,
    addShiftTask,
    toggleShiftTask,
    updateShiftTask,
    deleteShiftTask,
    moveShiftTaskToNextDay,
    activeShift,
    currentUser,
    setResumeShiftModalOpen,
    setShiftReviewModalOpen
  } = useAppStore();

  // Who the current user is allowed to assign a task to: themselves always, plus
  // their direct reports if they're a department head, plus anyone if super-admin.
  const assignableUsers = users.filter(u => u.id === currentUser.id || canAssignTo(currentUser, u));
  const canAssignOthers = isManagementUser(currentUser.role) && assignableUsers.length > 1;

  // Top Tab Switcher: 'shift-checklist' vs 'project-deliverables'
  const [activeTab, setActiveTab] = useState<'shift-checklist' | 'project-deliverables'>('shift-checklist');

  // Selected Project for Deliverables tab
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'p1');

  // Quick Task Add State (Project Deliverables)
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('high');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-10-15');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projName, setProjName] = useState('');
  const [projClientName, setProjClientName] = useState('');
  const [projServiceType, setProjServiceType] = useState<ServiceType>('custom-software');
  const [projDescription, setProjDescription] = useState('');
  const [projBudget, setProjBudget] = useState<number>(1500000);
  const [projCurrency, setProjCurrency] = useState<Currency>('NGN');
  const [projStartDate, setProjStartDate] = useState('2026-06-01');
  const [projEndDate, setProjEndDate] = useState('2026-08-30');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('in-progress');
  const [projProgress, setProjProgress] = useState<number>(50);

  // Deliverable Task Edit Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>('medium');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>('pending');
  const [editTaskAssignedTo, setEditTaskAssignedTo] = useState('');

  // ----------------------------------------------------
  // DAILY SHIFT CHECKLIST STATE
  // ----------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const [shiftFilter, setShiftFilter] = useState<'all' | 'pending' | 'completed' | 'carried'>('all');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('me');

  // Quick Add Shift Task State
  const [newShiftTaskTitle, setNewShiftTaskTitle] = useState('');
  const [newShiftTaskPriority, setNewShiftTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('high');
  const [newShiftTaskProject, setNewShiftTaskProject] = useState<string>('');

  // Shift Task Edit Modal State
  const [editingShiftTask, setEditingShiftTask] = useState<ShiftTask | null>(null);
  const [editShiftTitle, setEditShiftTitle] = useState('');
  const [editShiftPriority, setEditShiftPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [editShiftNotes, setEditShiftNotes] = useState('');

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projectTasks = tasks.filter(t => t.projectId === activeProject?.id);

  // Filter shift tasks for current user or all
  const userShiftTasks = shiftTasks.filter(st => {
    if (selectedStaffFilter === 'me') {
      return st.staffId === currentUser.id;
    }
    return true;
  });

  // Today's shift tasks
  const todayTasks = userShiftTasks.filter(st => st.date === todayStr);
  const todayCompletedCount = todayTasks.filter(st => st.status === 'completed').length;
  const todayPendingCount = todayTasks.filter(st => st.status === 'pending').length;
  const todayCarriedCount = todayTasks.filter(st => !!st.carriedForwardFrom).length;
  const completionPercentage = todayTasks.length > 0 ? Math.round((todayCompletedCount / todayTasks.length) * 100) : 0;

  // Filtered display list
  const displayedShiftTasks = todayTasks.filter(st => {
    if (shiftFilter === 'pending') return st.status === 'pending';
    if (shiftFilter === 'completed') return st.status === 'completed';
    if (shiftFilter === 'carried') return !!st.carriedForwardFrom;
    return true;
  });

  // Upcoming / Tomorrow tasks
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const tomorrowTasks = userShiftTasks.filter(st => st.date === tomorrowStr);

  const handleAddShiftTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftTaskTitle.trim()) return;

    const matchedProject = projects.find(p => p.id === newShiftTaskProject);

    addShiftTask({
      staffId: currentUser.id,
      staffName: currentUser.full_name || 'Staff Member',
      date: todayStr,
      title: newShiftTaskTitle.trim(),
      priority: newShiftTaskPriority,
      status: 'pending',
      projectId: matchedProject?.id,
      projectName: matchedProject?.name,
    });

    setNewShiftTaskTitle('');
    setNewShiftTaskProject('');
  };

  const openEditShiftModal = (st: ShiftTask) => {
    setEditingShiftTask(st);
    setEditShiftTitle(st.title);
    setEditShiftPriority(st.priority);
    setEditShiftNotes(st.notes || '');
  };

  const handleSaveShiftTaskEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShiftTask || !editShiftTitle.trim()) return;

    updateShiftTask(editingShiftTask.id, {
      title: editShiftTitle.trim(),
      priority: editShiftPriority,
      notes: editShiftNotes.trim() || undefined
    });

    setEditingShiftTask(null);
  };

  // Deliverables handlers
  const openAddProjectModal = () => {
    setEditingProject(null);
    setProjName('');
    setProjClientName('');
    setProjServiceType('custom-software');
    setProjDescription('');
    setProjBudget(1500000);
    setProjCurrency('NGN');
    setProjStartDate(new Date().toISOString().split('T')[0]);
    setProjEndDate('2026-10-30');
    setProjStatus('in-progress');
    setProjProgress(10);
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (proj: Project) => {
    setEditingProject(proj);
    setProjName(proj.name);
    setProjClientName(proj.clientName);
    setProjServiceType(proj.serviceType);
    setProjDescription(proj.description || '');
    setProjBudget(proj.budget);
    setProjCurrency(proj.currency);
    setProjStartDate(proj.startDate);
    setProjEndDate(proj.endDate);
    setProjStatus(proj.status);
    setProjProgress(proj.progress);
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projClientName.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, {
        name: projName,
        clientName: projClientName,
        serviceType: projServiceType,
        description: projDescription,
        budget: Number(projBudget),
        currency: projCurrency,
        startDate: projStartDate,
        endDate: projEndDate,
        status: projStatus,
        progress: Number(projProgress),
      });
    } else {
      addProject({
        name: projName,
        clientName: projClientName,
        serviceType: projServiceType,
        description: projDescription,
        budget: Number(projBudget),
        currency: projCurrency,
        startDate: projStartDate,
        endDate: projEndDate,
        status: projStatus,
        progress: Number(projProgress),
        assignedTeam: ['u1', 'u3'],
      });
    }

    closeProjectModal();
  };

  const handleDeleteProject = () => {
    if (!editingProject) return;
    if (confirm(`Are you sure you want to delete "${editingProject.name}"?`)) {
      deleteProject(editingProject.id);
      closeProjectModal();
      if (selectedProjectId === editingProject.id) {
        const remaining = projects.filter(p => p.id !== editingProject.id);
        if (remaining.length > 0) setSelectedProjectId(remaining[0].id);
      }
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeProject) return;

    // A non-management user can only ever create a task assigned to themselves —
    // department heads/admins can assign to anyone in assignableUsers.
    const assignee = canAssignOthers && newTaskAssignedTo ? newTaskAssignedTo : currentUser.id;

    addTask({
      projectId: activeProject.id,
      title: newTaskTitle,
      status: 'pending',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || '2026-10-15',
      order: projectTasks.length + 1,
      assignedTo: assignee,
    });

    setNewTaskTitle('');
    setNewTaskAssignedTo('');
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(task.dueDate);
    setEditTaskStatus(task.status);
    setEditTaskAssignedTo(task.assignedTo || '');
  };

  const closeTaskModal = () => {
    setEditingTask(null);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTaskTitle.trim()) return;

    // Only allow changing the assignee if the current user is actually allowed to
    // assign to the chosen person (or it's unchanged) — mirrors handleAddTask's rule.
    const requestedAssignee = editTaskAssignedTo || undefined;
    const canSetRequested = !requestedAssignee
      || requestedAssignee === editingTask.assignedTo
      || requestedAssignee === currentUser.id
      || (canAssignOthers && assignableUsers.some(u => u.id === requestedAssignee));
    const assignee = canSetRequested ? requestedAssignee : editingTask.assignedTo;

    updateTask(editingTask.id, {
      title: editTaskTitle,
      assignedTo: assignee,
      priority: editTaskPriority,
      dueDate: editTaskDueDate,
      status: editTaskStatus,
    });

    closeTaskModal();
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Delete this deliverable item?')) {
      deleteTask(taskId);
      if (editingTask?.id === taskId) closeTaskModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
              Tasks &amp; Project Operations
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Shift Checklist &amp; Sprints
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Set your daily shift task checklist on resume, track accomplishments, and rollover pending items automatically upon clock-out.
          </p>
        </div>

        {/* Action button based on active tab */}
        {activeTab === 'shift-checklist' ? (
          <div className="flex items-center gap-2">
            {activeShift ? (
              <button
                type="button"
                onClick={() => setShiftReviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>End Shift &amp; Review Checklist</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setResumeShiftModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
              >
                <Clock size={15} />
                <span>Resume Shift &amp; Set Plan</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={openAddProjectModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Main Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('shift-checklist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'shift-checklist'
                ? 'bg-[#0D52F8] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckSquare size={15} />
            <span>Daily Shift Task Checklist</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'shift-checklist' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {todayCompletedCount}/{todayTasks.length} Done
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('project-deliverables')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'project-deliverables'
                ? 'bg-[#0D52F8] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FolderKanban size={15} />
            <span>Client Projects &amp; Deliverables</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'project-deliverables' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {projects.length}
            </span>
          </button>
        </div>

        {activeTab === 'shift-checklist' && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Viewing:</span>
            <select
              value={selectedStaffFilter}
              onChange={e => setSelectedStaffFilter(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="me">My Tasks ({currentUser.full_name?.split(' ')[0] || 'Me'})</option>
              <option value="all">All Team Tasks</option>
            </select>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DAILY SHIFT TASK CHECKLIST                        */}
      {/* ======================================================== */}
      {activeTab === 'shift-checklist' && (
        <div className="space-y-6">
          {/* Shift Status Banner */}
          <div className={`p-4 rounded-2xl border transition shadow-xs ${
            activeShift
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200/80'
              : 'bg-gradient-to-r from-amber-50 via-orange-50/40 to-white border-amber-200/80'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  activeShift ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <Clock size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-900">
                      {activeShift ? 'Shift Active & Work Plan in Progress' : 'Shift Currently Inactive'}
                    </h2>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase font-mono ${
                      activeShift ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activeShift ? 'Clocked In' : 'Off Duty'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {activeShift
                      ? `Clocked in at ${new Date(activeShift.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Check off completed items as you work. Unfinished items will rollover to tomorrow upon clock-out.`
                      : 'Resume your shift to configure your work plan checklist. Any pending items from your last shift will be carried forward automatically.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                {activeShift ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setResumeShiftModalOpen(true)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
                    >
                      + Add Tasks to Plan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShiftReviewModalOpen(true)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} />
                      <span>Review &amp; End Shift</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResumeShiftModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles size={14} />
                    <span>Resume Shift &amp; Set Plan</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Planned Today
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{todayTasks.length}</span>
                <span className="text-xs text-slate-500 font-medium">deliverables</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                Accomplished
              </span>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600">{todayCompletedCount}</span>
                  <span className="text-xs text-slate-400">/ {todayTasks.length}</span>
                </div>
                <span className="text-xs font-black text-emerald-700 font-mono">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Pending Today
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600">{todayPendingCount}</span>
                <span className="text-xs text-slate-500 font-medium">to complete</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-blue-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                Carried Forward
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600">{todayCarriedCount}</span>
                <span className="text-xs text-slate-500 font-medium">from prior shift</span>
              </div>
            </div>
          </div>

          {/* Quick-Add Shift Task Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Plus size={14} className="text-[#0D52F8]" />
              <span>Add Goal to Today&apos;s Shift Checklist ({todayStr})</span>
            </h3>

            <form onSubmit={handleAddShiftTask} className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              <input
                type="text"
                required
                placeholder="What task or deliverable do you want to accomplish today?"
                value={newShiftTaskTitle}
                onChange={e => setNewShiftTaskTitle(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition"
              />

              <div className="flex items-center gap-2">
                <select
                  value={newShiftTaskPriority}
                  onChange={e => setNewShiftTaskPriority(e.target.value as any)}
                  className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="urgent">🔴 Urgent</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🔵 Medium</option>
                  <option value="low">⚪ Low</option>
                </select>

                <select
                  value={newShiftTaskProject}
                  onChange={e => setNewShiftTaskProject(e.target.value)}
                  className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[180px] truncate"
                >
                  <option value="">(No Project Tag)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add to Plan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Checklist Filtering & Interactive List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Filter Pill Header */}
            <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShiftFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    shiftFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  All Today ({todayTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShiftFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    shiftFilter === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  Pending ({todayPendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShiftFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    shiftFilter === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  Accomplished ({todayCompletedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShiftFilter('carried')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    shiftFilter === 'carried'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  Carried Forward ({todayCarriedCount})
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                Showing {displayedShiftTasks.length} items
              </div>
            </div>

            {/* Shift Task Items List */}
            <div className="divide-y divide-slate-100">
              {displayedShiftTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <ListTodo size={22} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No shift tasks match this filter</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Use the quick-add bar above or resume shift to build your daily checklist.
                  </p>
                </div>
              ) : (
                displayedShiftTasks.map(st => {
                  const isCompleted = st.status === 'completed';

                  return (
                    <div
                      key={st.id}
                      className={`p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                        isCompleted ? 'bg-slate-50/50 hover:bg-slate-50' : 'hover:bg-blue-50/20'
                      }`}
                    >
                      {/* Left: Checkbox & Title */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleShiftTask(st.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer shrink-0"
                          title={isCompleted ? 'Mark as pending' : 'Mark as accomplished'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={18} className="text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Square size={18} className="text-slate-400 group-hover:text-slate-600" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold transition ${
                              isCompleted ? 'line-through text-slate-400 font-medium' : 'text-slate-800'
                            }`}>
                              {st.title}
                            </span>

                            {/* Priority Badge */}
                            <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-full ${
                              st.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : st.priority === 'high'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : st.priority === 'medium'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {st.priority}
                            </span>

                            {/* Project Tag */}
                            {st.projectName && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-purple-50 text-purple-700 border border-purple-200/80">
                                {st.projectName}
                              </span>
                            )}

                            {/* Carried Forward Pill */}
                            {st.carriedForwardFrom && (
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <RotateCcw size={10} />
                                <span>Rolled over from {st.carriedForwardFrom}</span>
                              </span>
                            )}
                          </div>

                          {/* Notes / Owner metadata */}
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span>Owner: <strong className="text-slate-600 font-medium">{st.staffName}</strong></span>
                            {st.notes && (
                              <span className="italic text-slate-500 truncate max-w-md">
                                &ldquo;{st.notes}&rdquo;
                              </span>
                            )}
                            {isCompleted && st.completedAt && (
                              <span className="text-emerald-600 font-medium font-mono text-[10px]">
                                Accomplished {new Date(st.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => moveShiftTaskToNextDay(st.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Move this pending task forward to tomorrow"
                          >
                            <span>Move to Tomorrow</span>
                            <ArrowRight size={11} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditShiftModal(st)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                          title="Edit Task"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${st.title}"?`)) {
                              deleteShiftTask(st.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Upcoming / Tomorrow Preview Strip */}
            {tomorrowTasks.length > 0 && (
              <div className="p-3 bg-blue-50/40 border-t border-slate-200/80 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  <span className="font-bold">Tomorrow&apos;s Queued Tasks ({tomorrowStr}):</span>
                  <span className="text-[11px] text-blue-700">
                    {tomorrowTasks.length} task{tomorrowTasks.length > 1 ? 's' : ''} scheduled or moved forward.
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-100 px-2 py-0.5 rounded-full text-blue-800">
                  Auto-loaded upon resume
                </span>
              </div>
            )}
          </div>

          {/* End of Shift Callout Card */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>End-of-Shift Routine &amp; Task Rollover</span>
              </h4>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                When you clock out, all checked items will be recorded as completed for today&apos;s shift report. Any remaining pending tasks are automatically rolled forward to your next shift checklist so nothing gets dropped.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShiftReviewModalOpen(true)}
              className="px-4 py-2.5 bg-[#0D52F8] hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-xs transition shrink-0 cursor-pointer self-start sm:self-auto flex items-center gap-2"
            >
              <CheckCircle2 size={15} />
              <span>Launch Shift Review &amp; Rollover</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CLIENT PROJECTS & SPRINT DELIVERABLES             */}
      {/* ======================================================== */}
      {activeTab === 'project-deliverables' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Project Cards */}
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Projects Portfolio
              </span>
              <button
                type="button"
                onClick={openAddProjectModal}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {projects.map(proj => {
              const isSelected = proj.id === activeProject?.id;
              const projTasks = tasks.filter(t => t.projectId === proj.id);
              const completedCount = projTasks.filter(t => t.status === 'completed').length;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition space-y-2.5 relative group ${
                    isSelected
                      ? 'bg-white border-[#0D52F8] shadow-md ring-1 ring-blue-500/20'
                      : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {proj.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">{proj.clientName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getProjectStatusBadge(proj.status)}`}>
                        {proj.status}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditProjectModal(proj);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                      >
                        <Edit3 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{completedCount} / {projTasks.length} Tasks</span>
                      <span className="font-bold text-slate-700">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#0D52F8] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>Due {formatDate(proj.endDate)}</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatCurrency(proj.budget, proj.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Project Details & Milestone Sprint Deliverables */}
          <div className="lg:col-span-2 space-y-4">
            {activeProject && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-5 shadow-xs">
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {activeProject.serviceType.replace('-', ' ')}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h2 className="text-base font-bold text-slate-900">{activeProject.name}</h2>
                      <button
                        type="button"
                        onClick={() => openEditProjectModal(activeProject)}
                        className="text-slate-400 hover:text-blue-600 p-0.5"
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      {activeProject.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Contract</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {formatCurrency(activeProject.budget, activeProject.currency)}
                    </span>
                  </div>
                </div>

                {/* Project Sprint Deliverables Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare size={16} className="text-[#0D52F8]" />
                      <h3 className="text-xs font-bold text-slate-900">
                        Project Sprint Deliverables ({projectTasks.length})
                      </h3>
                    </div>
                  </div>

                  {/* Add Task Form */}
                  <form onSubmit={handleAddTask} className="flex flex-wrap gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add a new milestone or action item..."
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <select
                      value={newTaskPriority}
                      onChange={e => setNewTaskPriority(e.target.value as TaskPriority)}
                      className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={e => setNewTaskDueDate(e.target.value)}
                      className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                    >
                    </input>
                    {canAssignOthers ? (
                      <select
                        value={newTaskAssignedTo}
                        onChange={e => setNewTaskAssignedTo(e.target.value)}
                        className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                        title="Assign to"
                      >
                        <option value="">Assign to me</option>
                        {assignableUsers.filter(u => u.id !== currentUser.id).map(u => (
                          <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2.5 py-2 border border-slate-100 rounded-lg text-xs bg-slate-50 text-slate-400" title="Only a department head can assign tasks to someone else">
                        Assigned to me
                      </span>
                    )}
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs shrink-0 transition cursor-pointer"
                    >
                      Add Task
                    </button>
                  </form>

                  {/* Task items list */}
                  <div className="space-y-1.5 pt-2">
                    {projectTasks.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs italic">
                        No tasks created for this project yet.
                      </div>
                    ) : (
                      projectTasks.map(task => {
                        const isDone = task.status === 'completed';
                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between transition group ${
                              isDone
                                ? 'bg-slate-50/60 border-slate-100 text-slate-400'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div
                              onClick={() => toggleTask(task.id)}
                              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 mr-3"
                            >
                              {isDone ? (
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                              ) : (
                                <Square size={16} className="text-slate-400 shrink-0" />
                              )}
                              <span className={`font-medium truncate ${isDone ? 'line-through' : ''}`}>
                                {task.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-mono shrink-0">
                              {task.assignedTo && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-semibold normal-case" title="Assigned to">
                                  {users.find(u => u.id === task.assignedTo)?.full_name.split(' ')[0] || 'Unknown'}
                                </span>
                              )}
                              <span>Due {formatDate(task.dueDate)}</span>
                              <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                task.priority === 'urgent'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                  : task.priority === 'high'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {task.priority}
                              </span>
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => openEditTaskModal(task)}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition"
                                  title="Edit Task"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                  title="Delete Task"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Shift Task Modal */}
      {editingShiftTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingShiftTask(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">Edit Shift Checklist Item</h2>
              <button
                type="button"
                onClick={() => setEditingShiftTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveShiftTaskEdit} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={editShiftTitle}
                  onChange={e => setEditShiftTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                <select
                  value={editShiftPriority}
                  onChange={e => setEditShiftPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Progress Updates</label>
                <textarea
                  rows={2}
                  value={editShiftNotes}
                  onChange={e => setEditShiftNotes(e.target.value)}
                  placeholder="Additional context or blockers..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingShiftTask(null)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={closeProjectModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingProject ? 'Edit Client Project' : 'Create New Project'}
              </h2>
              <button
                type="button"
                onClick={closeProjectModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  placeholder="e.g. MODE Ops Suite Redesign"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client / Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={projClientName}
                    onChange={e => setProjClientName(e.target.value)}
                    placeholder="e.g. MODE Digital Internal"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Service Type</label>
                  <select
                    value={projServiceType}
                    onChange={e => setProjServiceType(e.target.value as ServiceType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="custom-software">Custom Software</option>
                    <option value="ecommerce-development">E-commerce Development</option>
                    <option value="website-development">Website Development</option>
                    <option value="lms-development">LMS Development</option>
                    <option value="cbt-platform">CBT Platform</option>
                    <option value="web-hosting">Web Hosting</option>
                    <option value="seo-services">SEO Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Description / Scope</label>
                <textarea
                  rows={2}
                  value={projDescription}
                  onChange={e => setProjDescription(e.target.value)}
                  placeholder="Consolidation of CRM, Expense Requisitions, and OMM..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Budget Amount</label>
                  <input
                    type="number"
                    value={projBudget}
                    onChange={e => setProjBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Currency</label>
                  <select
                    value={projCurrency}
                    onChange={e => setProjCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 cursor-not-allowed"
                    disabled
                  >
                    <option value="NGN">NGN (₦ - Nigerian Naira)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={projStartDate}
                    onChange={e => setProjStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={projEndDate}
                    onChange={e => setProjEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Project Status</label>
                  <select
                    value={projStatus}
                    onChange={e => setProjStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="planning">Planning</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Overall Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={projProgress}
                    onChange={e => setProjProgress(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {editingProject ? (
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 text-xs"
                  >
                    <Trash2 size={13} />
                    <span>Delete Project</span>
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeProjectModal}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Check size={14} />
                    <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Deliverable Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={closeTaskModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">Edit Sprint Deliverable</h2>
              <button
                type="button"
                onClick={closeTaskModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task / Deliverable Title *</label>
                <input
                  type="text"
                  required
                  value={editTaskTitle}
                  onChange={e => setEditTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={editTaskPriority}
                    onChange={e => setEditTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={editTaskStatus}
                    onChange={e => setEditTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={editTaskDueDate}
                  onChange={e => setEditTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned To</label>
                {canAssignOthers ? (
                  <select
                    value={editTaskAssignedTo}
                    onChange={e => setEditTaskAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={currentUser.id}>Me</option>
                    {assignableUsers.filter(u => u.id !== currentUser.id).map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    disabled
                    value={users.find(u => u.id === editTaskAssignedTo)?.full_name || 'Unassigned'}
                    className="w-full px-3 py-2 border border-slate-100 rounded-lg text-xs bg-slate-50 text-slate-400"
                    title="Only a department head can reassign this task"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(editingTask.id)}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 text-xs"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeTaskModal}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Check size={14} />
                    <span>Save Deliverable</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
