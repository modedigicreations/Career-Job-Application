import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/components/ui/Toast';
import StatCard from '@/components/ui/StatCard';
import { DollarSign, TrendingDown, TrendingUp, ShieldAlert } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { FinancialBreakdown } from '@/types';

function quarterOf(period: string): string {
  const [year, month] = period.split('-');
  const q = Math.ceil(Number(month) / 3);
  return `${year} Q${q}`;
}

export default function FinancialsPage() {
  const currentUser = useStore((s) => s.currentUser);
  const [granularity, setGranularity] = useState<'day' | 'month'>('month');
  const [data, setData] = useState<FinancialBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [rollup, setRollup] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (currentUser.role !== 'super-admin') return;
    setLoading(true);
    api.get<FinancialBreakdown>(`/dashboard/financials?granularity=${granularity}`)
      .then(setData)
      .catch((err) => showToast(err instanceof ApiError ? err.message : 'Failed to load financials', 'error'))
      .finally(() => setLoading(false));
  }, [granularity, currentUser.role]);

  const rollupData = useMemo(() => {
    if (!data) return [];
    if (granularity === 'day' || rollup === 'month') {
      return data.breakdown.map((b) => ({ period: b.period, revenue: b.revenue, expenses: b.expenses, profit: b.profit }));
    }
    const grouped = new Map<string, { revenue: number; expenses: number; profit: number }>();
    data.breakdown.forEach((b) => {
      const key = rollup === 'year' ? b.period.split('-')[0] : quarterOf(b.period);
      const g = grouped.get(key) || { revenue: 0, expenses: 0, profit: 0 };
      g.revenue += b.revenue; g.expenses += b.expenses; g.profit += b.profit;
      grouped.set(key, g);
    });
    return Array.from(grouped.entries()).map(([period, v]) => ({ period, ...v })).sort((a, b) => a.period.localeCompare(b.period));
  }, [data, rollup, granularity]);

  if (currentUser.role !== 'super-admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
          <ShieldAlert className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Restricted</h2>
        <p className="text-sm text-gray-500 max-w-sm">The financial dashboard is only accessible to the Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Revenue" value={loading ? '...' : formatCurrency(data?.totalRevenue ?? 0)} icon={DollarSign} iconColor="bg-emerald-100 text-emerald-600" />
        <StatCard title="Total Expenses" value={loading ? '...' : formatCurrency(data?.totalExpenses ?? 0)} icon={TrendingDown} iconColor="bg-red-100 text-red-600" />
        <StatCard
          title={(data?.totalProfit ?? 0) >= 0 ? 'Net Profit' : 'Net Loss'}
          value={loading ? '...' : formatCurrency(Math.abs(data?.totalProfit ?? 0))}
          icon={TrendingUp}
          iconColor={(data?.totalProfit ?? 0) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
        />
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Revenue vs Expenses</h3>
          <div className="flex items-center gap-2">
            <select value={granularity} onChange={(e) => setGranularity(e.target.value as 'day' | 'month')} className="input w-auto text-xs py-1">
              <option value="day">Daily</option>
              <option value="month">Monthly</option>
            </select>
            {granularity === 'month' && (
              <select value={rollup} onChange={(e) => setRollup(e.target.value as 'month' | 'quarter' | 'year')} className="input w-auto text-xs py-1">
                <option value="month">By Month</option>
                <option value="quarter">By Quarter</option>
                <option value="year">By Year</option>
              </select>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={rollupData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => formatCurrency(Number(v)).split('.')[0]} />
            <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
            <Legend />
            <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[2, 2, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
