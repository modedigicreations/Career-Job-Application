import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Search, FolderKanban, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import type { Project, ProjectStatus, ServiceType, Currency } from '@/types';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

const emptyProject: Omit<Project, 'id' | 'createdAt'> = {
  name: '', description: '', clientId: '', clientName: '', serviceType: 'website-development',
  status: 'pending', startDate: '', endDate: '', budget: 0, currency: 'NGN',
  progress: 0, assignedTeam: [],
};

export default function ProjectsPage() {
  const { projects, users, addProject, updateProject, deleteProject } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyProject);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.clientName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  function openCreate() { setEditing(null); setForm(emptyProject); setShowForm(true); }
  function openEdit(project: Project) { setEditing(project); setForm(project); setShowForm(true); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateProject(editing.id, form);
    } else {
      addProject({ ...form, id: uuid(), createdAt: new Date().toISOString() } as Project);
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> New Project</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects found" description="Start a new project to track your work." action={<button onClick={openCreate} className="btn-primary">New Project</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{project.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{project.clientName}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">{project.description}</p>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-700">{project.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className={cn('h-2 rounded-full transition-all', project.progress === 100 ? 'bg-green-500' : 'bg-brand-500')} style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
                <div className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {formatCurrency(project.budget, project.currency)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Project' : 'New Project'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">Project Name *</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="label">Client Name *</label><input required className="input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
            <div>
              <label className="label">Service Type</label>
              <select className="input" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value as ServiceType })}>
                <option value="website-development">Website Development</option>
                <option value="ecommerce-development">E-commerce Development</option>
                <option value="lms-development">LMS Development</option>
                <option value="custom-software">Custom Software</option>
                <option value="seo-services">SEO Services</option>
                <option value="web-hosting">Web Hosting</option>
                <option value="graphic-design">Graphic Design</option>
                <option value="social-media-management">Social Media</option>
                <option value="cbt-platform">CBT Platform</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div><label className="label">Progress (%)</label><input type="number" min="0" max="100" className="input" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} /></div>
            <div><label className="label">Start Date</label><input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="label">End Date</label><input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
                <option value="NGN">NGN</option><option value="GBP">GBP</option><option value="USD">USD</option>
              </select>
            </div>
            <div><label className="label">Budget</label><input type="number" className="input" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
