import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatDate, cn, MANAGER_TIER } from '@/lib/utils';
import { ApiError, api, downloadFile } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { showToast } from '@/components/ui/Toast';
import { Plus, Target, ClipboardList, Users as UsersIcon, Trash2, Edit2, CheckCircle2, Circle, Clock, AlertCircle, StickyNote, Download } from 'lucide-react';
import type { PersonalGoal, ManagerTask } from '@/types';

function mostRecentMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-500', medium: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-500',
};

const STATUS_ICONS: Record<string, typeof Circle> = {
  pending: Circle, 'in-progress': Clock, completed: CheckCircle2, blocked: AlertCircle,
};

const emptyGoal: Omit<PersonalGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  title: '', description: '', targetDate: '', status: 'pending',
};

const emptyTask = { title: '', description: '', assignedTo: '', dueDate: '', priority: 'medium' as ManagerTask['priority'] };

export default function OneMinuteManagerPage() {
  const { currentUser, users, personalGoals, managerTasks, addPersonalGoal, updatePersonalGoal, deletePersonalGoal, addManagerTask, updateManagerTask, deleteManagerTask } = useStore();
  const canAssign = MANAGER_TIER.includes(currentUser.role);
  const [tab, setTab] = useState<'goals' | 'my-tasks' | 'assigned'>('goals');

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PersonalGoal | null>(null);
  const [goalForm, setGoalForm] = useState(emptyGoal);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);

  const [dailyNote, setDailyNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [reportUserId, setReportUserId] = useState(currentUser.id);
  const [reportWeekStart, setReportWeekStart] = useState(mostRecentMonday());
  const [downloadingReport, setDownloadingReport] = useState(false);

  async function saveDailyNote() {
    if (!dailyNote.trim()) return;
    setSavingNote(true);
    try {
      await api.post('/daily-summaries', { date: new Date().toISOString(), note: dailyNote.trim() });
      showToast("Today's note saved");
      setDailyNote('');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to save note', 'error');
    } finally {
      setSavingNote(false);
    }
  }

  async function downloadReport() {
    setDownloadingReport(true);
    try {
      const staffName = users.find((u) => u.id === reportUserId)?.name ?? 'report';
      await downloadFile(
        `/reports/shift-report?userId=${reportUserId}&weekStart=${reportWeekStart}`,
        `shift-report-${staffName.replace(/\s+/g, '-')}-${reportWeekStart}.pdf`
      );
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to generate report', 'error');
    } finally {
      setDownloadingReport(false);
    }
  }

  const myTasks = managerTasks.filter((t) => t.assignedTo === currentUser.id);
  const assignedByMe = managerTasks.filter((t) => t.assignedBy === currentUser.id);

  function openAddGoal() { setEditingGoal(null); setGoalForm(emptyGoal); setShowGoalForm(true); }
  function openEditGoal(goal: PersonalGoal) { setEditingGoal(goal); setGoalForm(goal); setShowGoalForm(true); }

  async function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingGoal) {
        await updatePersonalGoal(editingGoal.id, goalForm);
        showToast('Goal updated');
      } else {
        await addPersonalGoal(goalForm);
        showToast('Goal added');
      }
      setShowGoalForm(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to save goal', 'error');
    }
  }

  async function handleTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addManagerTask({ ...taskForm, status: 'pending' });
      showToast('Task assigned');
      setShowTaskForm(false);
      setTaskForm(emptyTask);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to assign task', 'error');
    }
  }

  async function updateMyTaskStatus(task: ManagerTask, status: ManagerTask['status']) {
    try {
      await updateManagerTask(task.id, { status });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update task', 'error');
    }
  }

  const tabs = [
    { key: 'goals' as const, label: 'My Goals', icon: Target },
    { key: 'my-tasks' as const, label: 'My Tasks', icon: ClipboardList },
    ...(canAssign ? [{ key: 'assigned' as const, label: 'Tasks I\'ve Assigned', icon: UsersIcon }] : []),
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Today's End-of-Shift Note</h3>
          </div>
          <textarea
            className="input"
            rows={2}
            placeholder="What did you work on today?"
            value={dailyNote}
            onChange={(e) => setDailyNote(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button onClick={saveDailyNote} disabled={savingNote || !dailyNote.trim()} className="btn-primary text-xs py-1.5">
              {savingNote ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Weekly Shift Report</h3>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {canAssign && (
              <div className="flex-1 min-w-[140px]">
                <label className="label">Staff</label>
                <select className="input" value={reportUserId} onChange={(e) => setReportUserId(e.target.value)}>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex-1 min-w-[140px]">
              <label className="label">Week Starting (Mon)</label>
              <input type="date" className="input" value={reportWeekStart} onChange={(e) => setReportWeekStart(e.target.value)} />
            </div>
            <button onClick={downloadReport} disabled={downloadingReport} className="btn-secondary text-xs py-2">
              {downloadingReport ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                tab === t.key ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="h-4 w-4" />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'goals' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Personal goals are yours alone — nobody else can assign or edit them.</p>
          <div className="flex justify-end">
            <button onClick={openAddGoal} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> Add Goal</button>
          </div>
          {personalGoals.length === 0 ? (
            <EmptyState icon={Target} title="No personal goals yet" description="Set a goal for yourself to track." action={<button onClick={openAddGoal} className="btn-primary">Add Goal</button>} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {personalGoals.map((goal) => (
                <div key={goal.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">{goal.title}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEditGoal(goal)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="h-3.5 w-3.5 text-gray-400" /></button>
                      <button onClick={async () => { if (confirm('Delete this goal?')) { try { await deletePersonalGoal(goal.id); showToast('Goal deleted'); } catch (err) { showToast(err instanceof ApiError ? err.message : 'Failed to delete goal', 'error'); } } }} className="p-1 rounded hover:bg-gray-100"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                    </div>
                  </div>
                  {goal.description && <p className="text-xs text-gray-500 mb-2">{goal.description}</p>}
                  <div className="flex items-center justify-between text-xs">
                    <select
                      value={goal.status}
                      onChange={async (e) => { try { await updatePersonalGoal(goal.id, { status: e.target.value as PersonalGoal['status'] }); } catch (err) { showToast(err instanceof ApiError ? err.message : 'Failed to update goal', 'error'); } }}
                      className="input w-auto text-xs py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {goal.targetDate && <span className="text-gray-400">Target: {formatDate(goal.targetDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'my-tasks' && (
        <div className="card">
          {myTasks.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No tasks assigned to you" description="Tasks a manager assigns to you via the One Minute Manager will show up here." />
          ) : (
            <div className="divide-y divide-gray-100">
              {myTasks.map((task) => {
                const Icon = STATUS_ICONS[task.status];
                return (
                  <div key={task.id} className="flex items-center gap-4 px-6 py-3">
                    <Icon className={cn('h-5 w-5 flex-shrink-0', task.status === 'completed' ? 'text-green-500' : task.status === 'blocked' ? 'text-red-500' : 'text-gray-300')} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900')}>{task.title}</p>
                      {task.description && <p className="text-xs text-gray-500 truncate">{task.description}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">Assigned by {task.creator?.name ?? 'Unknown'}{task.dueDate && ` · Due ${formatDate(task.dueDate)}`}</p>
                    </div>
                    <span className={cn('text-xs font-medium capitalize flex-shrink-0', PRIORITY_COLORS[task.priority])}>{task.priority}</span>
                    <select
                      value={task.status}
                      onChange={(e) => updateMyTaskStatus(task, e.target.value as ManagerTask['status'])}
                      className="input w-auto text-xs py-1 flex-shrink-0"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'assigned' && canAssign && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowTaskForm(true)} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> Assign Task</button>
          </div>
          <div className="card">
            {assignedByMe.length === 0 ? (
              <EmptyState icon={UsersIcon} title="No tasks assigned yet" description="Assign a task to a team member." action={<button onClick={() => setShowTaskForm(true)} className="btn-primary">Assign Task</button>} />
            ) : (
              <div className="divide-y divide-gray-100">
                {assignedByMe.map((task) => {
                  const Icon = STATUS_ICONS[task.status];
                  return (
                    <div key={task.id} className="flex items-center gap-4 px-6 py-3">
                      <Icon className={cn('h-5 w-5 flex-shrink-0', task.status === 'completed' ? 'text-green-500' : task.status === 'blocked' ? 'text-red-500' : 'text-gray-300')} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900')}>{task.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Assigned to {task.assignee?.name ?? 'Unknown'}{task.dueDate && ` · Due ${formatDate(task.dueDate)}`}</p>
                      </div>
                      <span className="badge bg-gray-100 text-gray-600 capitalize flex-shrink-0">{task.status.replace('-', ' ')}</span>
                      <button
                        onClick={async () => { if (confirm('Delete this task?')) { try { await deleteManagerTask(task.id); showToast('Task deleted'); } catch (err) { showToast(err instanceof ApiError ? err.message : 'Failed to delete task', 'error'); } } }}
                        className="p-1 rounded hover:bg-gray-100 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showGoalForm} onClose={() => setShowGoalForm(false)} title={editingGoal ? 'Edit Goal' : 'Add Goal'}>
        <form onSubmit={handleGoalSubmit} className="space-y-4">
          <div><label className="label">Title *</label><input required className="input" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} /></div>
          <div><label className="label">Target Date</label><input type="date" className="input" value={goalForm.targetDate} onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowGoalForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingGoal ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showTaskForm} onClose={() => setShowTaskForm(false)} title="Assign Task">
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div><label className="label">Title *</label><input required className="input" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Assign To *</label>
              <select required className="input" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                <option value="">Select...</option>
                {users.filter((u) => u.id !== currentUser.id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div><label className="label">Due Date</label><input type="date" className="input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as ManagerTask['priority'] })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowTaskForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Assign</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
