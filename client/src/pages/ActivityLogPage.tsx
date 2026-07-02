import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatRelativeTime, getInitials, cn } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import {
  History, Search, PhoneCall, Mail, Users, StickyNote,
  CheckSquare, TrendingUp, UserPlus, FileText,
} from 'lucide-react';
import type { Activity } from '@/types';

const TYPE_OPTIONS: { value: Activity['type']; label: string }[] = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
  { value: 'task', label: 'Task' },
  { value: 'deal-update', label: 'Deal Update' },
  { value: 'lead-created', label: 'Lead Created' },
  { value: 'invoice-sent', label: 'Invoice Sent' },
];

const ENTITY_OPTIONS: { value: Activity['entityType']; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'contact', label: 'Contact' },
  { value: 'deal', label: 'Deal' },
  { value: 'project', label: 'Project' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'ticket', label: 'Ticket' },
];

const TYPE_ICONS: Record<Activity['type'], { icon: typeof PhoneCall; color: string }> = {
  call: { icon: PhoneCall, color: 'bg-amber-100 text-amber-600' },
  email: { icon: Mail, color: 'bg-purple-100 text-purple-600' },
  meeting: { icon: Users, color: 'bg-blue-100 text-blue-600' },
  note: { icon: StickyNote, color: 'bg-gray-100 text-gray-600' },
  task: { icon: CheckSquare, color: 'bg-indigo-100 text-indigo-600' },
  'deal-update': { icon: TrendingUp, color: 'bg-pink-100 text-pink-600' },
  'lead-created': { icon: UserPlus, color: 'bg-green-100 text-green-600' },
  'invoice-sent': { icon: FileText, color: 'bg-cyan-100 text-cyan-600' },
};

export default function ActivityLogPage() {
  const activities = useStore((s) => s.activities);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return activities
      .filter((a) => {
        const matchSearch = !search ||
          a.description.toLowerCase().includes(search.toLowerCase()) ||
          a.userName.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || a.type === typeFilter;
        const matchEntity = entityFilter === 'all' || a.entityType === entityFilter;
        return matchSearch && matchType && matchEntity;
      })
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activities, search, typeFilter, entityFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-auto" aria-label="Filter by type">
          <option value="all">All Types</option>
          {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="input w-auto" aria-label="Filter by related record">
          <option value="all">All Records</option>
          {ENTITY_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <span className="text-xs text-gray-400 sm:ml-auto">
          {filtered.length} activit{filtered.length === 1 ? 'y' : 'ies'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activities found"
          description="Activities will appear here as your team works. Try adjusting your filters."
        />
      ) : (
        <div className="card divide-y divide-gray-100">
          {filtered.map((activity) => {
            const { icon: Icon, color } = TYPE_ICONS[activity.type] ?? TYPE_ICONS.note;
            return (
              <div key={activity.id} className="flex items-start gap-4 px-6 py-4">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0', color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[9px] font-bold text-gray-600">
                      {getInitials(activity.userName)}
                    </div>
                    <span className="text-xs text-gray-500">{activity.userName}</span>
                    <span className="text-xs text-gray-300">&middot;</span>
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{activity.entityType}</span>
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{activity.type.replace(/-/g, ' ')}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0" title={new Date(activity.createdAt).toLocaleString()}>
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
