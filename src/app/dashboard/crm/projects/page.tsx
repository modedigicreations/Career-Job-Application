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
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Project, Task } from '@/lib/types';
import { formatCurrency, formatDate, getProjectStatusBadge } from '@/lib/utils';

export default function ProjectsPage() {
  const { projects, tasks, toggleTask, addTask } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'p1');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projectTasks = tasks.filter(t => t.projectId === activeProject?.id);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeProject) return;

    addTask({
      projectId: activeProject.id,
      title: newTaskTitle,
      status: 'pending',
      priority: 'high',
      dueDate: '2026-10-15',
      order: projectTasks.length + 1,
    });

    setNewTaskTitle('');
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
      </div>

      {/* Grid Layout: Left Projects Selector, Right Task Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Project Cards */}
        <div className="space-y-3 min-w-0">
          <div className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">
            Projects Portfolio
          </div>
          {projects.map(proj => {
            const isSelected = proj.id === activeProject?.id;
            const projTasks = tasks.filter(t => t.projectId === proj.id);
            const completedCount = projTasks.filter(t => t.status === 'completed').length;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2.5 ${
                  isSelected
                    ? 'bg-white border-[#0D52F8] shadow-md ring-1 ring-blue-500/20'
                    : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 leading-snug">{proj.name}</h3>
                    <span className="text-[11px] text-slate-500">{proj.clientName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getProjectStatusBadge(proj.status)}`}>
                    {proj.status}
                  </span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {activeProject.serviceType.replace('-', ' ')}
                  </span>
                  <h2 className="text-lg font-black text-slate-900 mt-0.5">{activeProject.name}</h2>
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

                {/* Quick Add Task Form */}
                <form onSubmit={handleAddTask} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Add a new milestone or action item..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                          onClick={() => toggleTask(task.id)}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                            isDone
                              ? 'bg-slate-50/60 border-slate-100 text-slate-400 line-through'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDone ? (
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            ) : (
                              <Square size={16} className="text-slate-400 shrink-0" />
                            )}
                            <span className="font-medium">{task.title}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono shrink-0">
                            <span>Due {formatDate(task.dueDate)}</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              task.priority === 'urgent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {task.priority}
                            </span>
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
    </div>
  );
}
