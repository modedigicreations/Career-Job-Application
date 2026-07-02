import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Users, DollarSign, FolderKanban, TrendingUp, Clock, CheckCircle2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { Link } from 'react-router-dom';

const PIPELINE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#6366f1', '#ec4899', '#22c55e', '#ef4444'];

export default function DashboardPage() {
  const { leads, projects, invoices, payments, hostingAccounts, activities } = useStore();

  const totalLeads = leads.length;
  const activeDeals = leads.filter((l) => !['won', 'lost'].includes(l.status)).length;
  const wonDeals = leads.filter((l) => l.status === 'won').length;
  const winRate = totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0;
  const now = new Date();
  const leadsThisMonth = leads.filter((l) => {
    const d = new Date(l.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const activeProjects = projects.filter((p) => p.status === 'in-progress').length;
  const outstandingInvoices = invoices
    .filter((i) => ['sent', 'partially-paid', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + (i.total - i.amountPaid), 0);

  const pipelineData = [
    { name: 'New Lead', count: leads.filter((l) => l.status === 'new-lead').length },
    { name: 'Qualified', count: leads.filter((l) => l.status === 'qualified').length },
    { name: 'Contacted', count: leads.filter((l) => l.status === 'contacted').length },
    { name: 'Discovery', count: leads.filter((l) => l.status === 'discovery-call').length },
    { name: 'Proposal', count: leads.filter((l) => l.status === 'proposal-sent').length },
    { name: 'Negotiation', count: leads.filter((l) => l.status === 'negotiation').length },
    { name: 'Won', count: leads.filter((l) => l.status === 'won').length },
    { name: 'Lost', count: leads.filter((l) => l.status === 'lost').length },
  ];

  const sourceData = [
    { name: 'Website', value: leads.filter((l) => l.source === 'website').length },
    { name: 'Facebook', value: leads.filter((l) => l.source === 'facebook-ads').length },
    { name: 'Google', value: leads.filter((l) => l.source === 'google-ads').length },
    { name: 'WhatsApp', value: leads.filter((l) => l.source === 'whatsapp').length },
    { name: 'Referral', value: leads.filter((l) => l.source === 'referral').length },
    { name: 'Other', value: leads.filter((l) => ['manual', 'csv-import'].includes(l.source)).length },
  ].filter((d) => d.value > 0);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth: Record<string, number> = {};
  monthNames.forEach((m) => { revenueByMonth[m] = 0; });
  payments.forEach((p) => {
    const d = new Date(p.date);
    if (d.getFullYear() === new Date().getFullYear()) {
      revenueByMonth[monthNames[d.getMonth()]] += p.amount;
    }
  });
  const monthlyRevenue = monthNames.map((month) => ({ month, revenue: revenueByMonth[month] }));

  const recentActivities = activities.slice(0, 8);
  const upcomingRenewals = hostingAccounts
    .filter((h) => h.status === 'active')
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Leads" value={totalLeads} change={`+${leadsThisMonth} this month`} changeType={leadsThisMonth > 0 ? 'positive' : 'neutral'} icon={Users} />
        <StatCard title="Active Deals" value={activeDeals} icon={TrendingUp} iconColor="bg-purple-100 text-purple-600" />
        <StatCard title="Won Deals" value={wonDeals} change={`${winRate}% win rate`} changeType="positive" icon={CheckCircle2} iconColor="bg-green-100 text-green-600" />
        <StatCard title="Revenue (Paid)" value={formatCurrency(totalRevenue)} icon={DollarSign} iconColor="bg-emerald-100 text-emerald-600" />
        <StatCard title="Active Projects" value={activeProjects} icon={FolderKanban} iconColor="bg-orange-100 text-orange-600" />
        <StatCard title="Outstanding" value={formatCurrency(outstandingInvoices)} change="Unpaid invoices" changeType="negative" icon={Clock} iconColor="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sales Pipeline</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {pipelineData.map((_, i) => (
                  <Cell key={i} fill={PIPELINE_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue Trend ({new Date().getFullYear()})</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={PIPELINE_COLORS[i % PIPELINE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <Link to="/activities" className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 flex-shrink-0">
                  {getInitials(activity.userName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(activity.createdAt)} &middot; {activity.userName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Active Projects</h3>
            <Link to="/projects" className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all</Link>
          </div>
          <div className="space-y-4">
            {projects.filter((p) => p.status === 'in-progress').map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.clientName}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-600">{project.progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${project.progress}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Domain Renewals</h3>
            <Link to="/hosting" className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {upcomingRenewals.map((account) => {
              const daysLeft = Math.ceil((new Date(account.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={account.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{account.domainName}</p>
                    <p className="text-xs text-gray-500">{account.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Expires {formatDate(account.expiryDate)}</p>
                    <StatusBadge
                      status={daysLeft <= 7 ? 'overdue' : daysLeft <= 30 ? 'pending' : 'active'}
                      label={daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
