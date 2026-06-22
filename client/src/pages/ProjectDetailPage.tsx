import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';
import { ArrowLeft, Plus, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import type { Task, TaskStatus } from '@/types';

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const TASK_ICONS = {
  pending: Circle,
  'in-progress': Clock,
  completed: CheckCircle2,
  blocked: AlertCircle,
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, tasks, users, addTask, updateTask, deleteTask, updateProject } = useStore();
  const project = projects.find((p) => p.id === id);
  const projectTasks = tasks.filter((t) => t.projectId === id).sort((a, b) => a.order - b.order);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium' as Task['priority'], status: 'pending' as TaskStatus });

  if (!project) return <div className="text-center py-16"><p className="text-gray-500">Project not found.</p><Link to="/projects" className="text-brand-500 text-sm">Back to Projects</Link></div>;

  const proj = project;
  const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
  const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : proj.progress;

  function openAddTask() {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium', status: 'pending' });
    setShowTaskForm(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTaskForm({ title: task.title, description: task.description, assignedTo: task.assignedTo, dueDate: task.dueDate, priority: task.priority, status: task.status });
    setShowTaskForm(true);
  }

  function calcProgress(tasksSnapshot: Task[], overrides?: { taskId?: string; newStatus?: TaskStatus; isNew?: boolean; newTaskCompleted?: boolean }) {
    let completed = tasksSnapshot.filter((t) =>
      t.id === overrides?.taskId ? overrides.newStatus === 'completed' : t.status === 'completed'
    ).length;
    let total = tasksSnapshot.length;
    if (overrides?.isNew) {
      total += 1;
      if (overrides.newTaskCompleted) completed += 1;
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  function handleTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingTask) {
      updateTask(editingTask.id, taskForm);
      updateProject(proj.id, { progress: calcProgress(projectTasks, { taskId: editingTask.id, newStatus: taskForm.status }) });
    } else {
      addTask({
        ...taskForm, id: uuid(), projectId: proj.id,
        order: projectTasks.length + 1, createdAt: new Date().toISOString(),
      } as Task);
      updateProject(proj.id, { progress: calcProgress(projectTasks, { isNew: true, newTaskCompleted: taskForm.status === 'completed' }) });
    }
    setShowTaskForm(false);
  }

  function toggleTaskStatus(task: Task) {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, { status: newStatus });
    updateProject(proj.id, { progress: calcProgress(projectTasks, { taskId: task.id, newStatus }) });
  }

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{proj.name}</h2>
              <StatusBadge status={proj.status} />
            </div>
            <p className="text-sm text-gray-500">{proj.clientName}</p>
            <p className="text-sm text-gray-600 mt-2">{proj.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(proj.budget, proj.currency)}</p>
            <p className="text-xs text-gray-500">{formatDate(proj.startDate)} - {formatDate(proj.endDate)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-semibold text-gray-900">{progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-100">
            <div className={cn('h-3 rounded-full transition-all', progress === 100 ? 'bg-green-500' : 'bg-brand-500')} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>{completedTasks}/{projectTasks.length} tasks completed</span>
          <span>Team: {proj.assignedTeam.map((uid) => users.find((u) => u.id === uid)?.name.split(' ')[0]).filter(Boolean).join(', ') || 'Unassigned'}</span>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
          <button onClick={openAddTask} className="btn-primary text-xs py-1.5"><Plus className="h-3.5 w-3.5 mr-1" /> Add Task</button>
        </div>

        {projectTasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No tasks yet. Add tasks to track project progress.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projectTasks.map((task) => {
              const Icon = TASK_ICONS[task.status];
              const assignee = users.find((u) => u.id === task.assignedTo);
              return (
                <div key={task.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
                  <button onClick={() => toggleTaskStatus(task)} className="flex-shrink-0">
                    <Icon className={cn('h-5 w-5', task.status === 'completed' ? 'text-green-500' : task.status === 'blocked' ? 'text-red-500' : 'text-gray-300')} />
                  </button>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditTask(task)}>
                    <p className={cn('text-sm font-medium', task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900')}>{task.title}</p>
                    {task.description && <p className="text-xs text-gray-500 truncate">{task.description}</p>}
                  </div>
                  <span className={cn('text-xs font-medium capitalize', PRIORITY_COLORS[task.priority])}>{task.priority}</span>
                  {assignee && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600" title={assignee.name}>
                      {getInitials(assignee.name)}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 flex-shrink-0">{task.dueDate ? formatDate(task.dueDate) : ''}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showTaskForm} onClose={() => setShowTaskForm(false)} title={editingTask ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div><label className="label">Title *</label><input required className="input" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Assigned To</label>
              <select className="input" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div><label className="label">Due Date</label><input type="date" className="input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Task['priority'] })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}>
                <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowTaskForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingTask ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
