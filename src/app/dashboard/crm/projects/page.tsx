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
  Check
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Project, Task, ServiceType, ProjectStatus, TaskPriority, Currency, TaskStatus } from '@/lib/types';
import { formatCurrency, formatDate, getProjectStatusBadge } from '@/lib/utils';

export default function ProjectsPage() {
  const {
    projects,
    tasks,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    addProject,
    updateProject,
    deleteProject
  } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'p1');

  // Quick Task Add State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('high');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-10-15');

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

  // Task Edit Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>('medium');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>('pending');

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projectTasks = tasks.filter(t => t.projectId === activeProject?.id);

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

    addTask({
      projectId: activeProject.id,
      title: newTaskTitle,
      status: 'pending',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || '2026-10-15',
      order: projectTasks.length + 1,
    });

    setNewTaskTitle('');
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(task.dueDate);
    setEditTaskStatus(task.status);
  };

  const closeTaskModal = () => {
    setEditingTask(null);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTaskTitle.trim()) return;

    updateTask(editingTask.id, {
      title: editTaskTitle,
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Client Projects & Task Checklists
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {projects.length} Active Engagements
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deliver software sprints, e-commerce milestones, and task deliverables with transparency.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddProjectModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid Layout: Left Projects Selector, Right Task Checklist */}
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
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-slate-900 leading-snug truncate">{proj.name}</h3>
                    <span className="text-[11px] text-slate-500 truncate block">{proj.clientName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getProjectStatusBadge(proj.status)}`}>
                      {proj.status}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditProjectModal(proj);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Project"
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>{completedCount} / {projTasks.length} Tasks</span>
                    <span className="font-bold text-slate-700">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Due {formatDate(proj.endDate)}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(proj.budget, proj.currency)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Project Details & Tasks Checklist */}
        <div className="lg:col-span-2 space-y-5 min-w-0">
          {activeProject && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {activeProject.serviceType.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h2 className="text-lg font-black text-slate-900">{activeProject.name}</h2>
                    <button
                      type="button"
                      onClick={() => openEditProjectModal(activeProject)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition"
                      title="Edit Project Details"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">{activeProject.description}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs text-slate-400 font-semibold block">Total Contract</span>
                  <span className="text-lg font-black text-slate-900">
                    {formatCurrency(activeProject.budget, activeProject.currency)}
                  </span>
                </div>
              </div>

              {/* Task Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-blue-600" />
                    <span>Project Sprint Deliverables ({projectTasks.length})</span>
                  </h3>
                </div>

                {/* Quick Add Task Form with Priority & Due Date */}
                <form onSubmit={handleAddTask} className="flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="text"
                    required
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
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs shrink-0 transition"
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

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Total Contract Budget</label>
                  <input
                    type="number"
                    min="0"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
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
                  <label className="block text-slate-700 font-semibold mb-1">Due / Delivery Date</label>
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
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={projStatus}
                    onChange={e => setProjStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Progress ({projProgress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={projProgress}
                    onChange={e => setProjProgress(Number(e.target.value))}
                    className="w-full h-8 cursor-pointer accent-[#0D52F8]"
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

      {/* Edit Task Modal */}
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
