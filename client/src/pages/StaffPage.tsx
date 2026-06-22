import { useStore } from '@/store/useStore';
import { formatCurrency, getInitials } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, PhoneCall, Mail, Trophy, DollarSign, FolderCheck } from 'lucide-react';

export default function StaffPage() {
  const { users, leads, projects, invoices, activities } = useStore();

  const staffMetrics = users
    .filter((u) => u.isActive)
    .map((user) => {
      const userLeads = leads.filter((l) => l.assignedTo === user.id);
      const dealsWon = userLeads.filter((l) => l.status === 'won').length;
      const callsMade = activities.filter((a) => a.userId === user.id && a.type === 'call').length;
      const emailsSent = activities.filter((a) => a.userId === user.id && a.type === 'email').length;
      const userProjects = projects.filter((p) => p.assignedTeam.includes(user.id));
      const completedProjects = userProjects.filter((p) => p.status === 'completed').length;
      const revenue = userLeads
        .filter((l) => l.status === 'won')
        .reduce((sum, l) => sum + l.estimatedValue, 0);

      return {
        user,
        leadsGenerated: userLeads.length,
        callsMade,
        emailsSent,
        dealsWon,
        revenueGenerated: revenue,
        projectsCompleted: completedProjects,
        activeProjects: userProjects.filter((p) => p.status === 'in-progress').length,
      };
    });

  const chartData = staffMetrics.map((m) => ({
    name: m.user.name.split(' ')[0],
    leads: m.leadsGenerated,
    deals: m.dealsWon,
    calls: m.callsMade,
    emails: m.emailsSent,
  }));

  const topPerformer = staffMetrics.reduce((top, current) =>
    current.revenueGenerated > (top?.revenueGenerated || 0) ? current : top,
    staffMetrics[0]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="leads" fill="#3b82f6" name="Leads" radius={[2, 2, 0, 0]} />
              <Bar dataKey="deals" fill="#22c55e" name="Deals Won" radius={[2, 2, 0, 0]} />
              <Bar dataKey="calls" fill="#f59e0b" name="Calls" radius={[2, 2, 0, 0]} />
              <Bar dataKey="emails" fill="#8b5cf6" name="Emails" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {topPerformer && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Performer</h3>
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xl font-bold mx-auto mb-3">
                {getInitials(topPerformer.user.name)}
              </div>
              <p className="text-lg font-bold text-gray-900">{topPerformer.user.name}</p>
              <p className="text-sm text-gray-500 capitalize mb-4">{topPerformer.user.role}</p>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">{topPerformer.dealsWon}</p>
                  <p className="text-xs text-gray-500">Deals Won</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(topPerformer.revenueGenerated)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {staffMetrics.map((m) => (
          <div key={m.user.id} className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                {getInitials(m.user.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{m.user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{m.user.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-lg font-bold text-gray-900">{m.leadsGenerated}</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase">Leads</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <PhoneCall className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-lg font-bold text-gray-900">{m.callsMade}</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase">Calls</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Mail className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-lg font-bold text-gray-900">{m.emailsSent}</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase">Emails</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Trophy className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-lg font-bold text-gray-900">{m.dealsWon}</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase">Won</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(m.revenueGenerated)}</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase">Revenue</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <FolderCheck className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-lg font-bold text-gray-900">{m.projectsCompleted}</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase">Done</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
