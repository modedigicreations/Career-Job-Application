'use client';

import React, { useMemo, useState } from 'react';
import { PiggyBank, TrendingUp, TrendingDown, Lock, ShieldAlert } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { isSuperAdminUser } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ProfitAndLossPage() {
  const { currentUser, payments, requisitions } = useAppStore();
  const isSuperAdmin = isSuperAdminUser(currentUser.role);

  // Only an approved-and-disbursed requisition is a real cash expense — Pending/Approved-
  // but-not-yet-paid-out shouldn't count against revenue yet.
  const completedRequisitions = useMemo(() => requisitions.filter(r => r.status === 'Completed'), [requisitions]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    payments.forEach(p => { const y = new Date(p.date).getFullYear(); if (!isNaN(y)) years.add(y); });
    completedRequisitions.forEach(r => {
      const y = new Date(r.completedAt || r.createdAt).getFullYear();
      if (!isNaN(y)) years.add(y);
    });
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [payments, completedRequisitions]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);

  const monthlyBreakdown = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({ month: i, revenue: 0, expenses: 0 }));
    payments.forEach(p => {
      const d = new Date(p.date);
      if (d.getFullYear() === selectedYear && !isNaN(d.getTime())) {
        months[d.getMonth()].revenue += p.amount;
      }
    });
    completedRequisitions.forEach(r => {
      const d = new Date(r.completedAt || r.createdAt);
      if (d.getFullYear() === selectedYear && !isNaN(d.getTime())) {
        months[d.getMonth()].expenses += r.amount;
      }
    });
    return months;
  }, [payments, completedRequisitions, selectedYear]);

  const quarters = useMemo(() => {
    return [0, 1, 2, 3].map(q => {
      const qMonths = monthlyBreakdown.slice(q * 3, q * 3 + 3);
      const revenue = qMonths.reduce((s, m) => s + m.revenue, 0);
      const expenses = qMonths.reduce((s, m) => s + m.expenses, 0);
      return { quarter: q + 1, revenue, expenses, profit: revenue - expenses };
    });
  }, [monthlyBreakdown]);

  const yearTotals = useMemo(() => {
    const revenue = monthlyBreakdown.reduce((s, m) => s + m.revenue, 0);
    const expenses = monthlyBreakdown.reduce((s, m) => s + m.expenses, 0);
    return { revenue, expenses, profit: revenue - expenses };
  }, [monthlyBreakdown]);

  if (!isSuperAdmin) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
            <Lock size={28} />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Restricted Confidential Module
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-3 mb-2 tracking-tight">
            Profit &amp; Loss
          </h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
            Company-wide revenue, expenses, and profitability are restricted to the Super Admin / Managing Director.
          </p>
        </div>
      </div>
    );
  }

  const maxMonthlyValue = Math.max(1, ...monthlyBreakdown.map(m => Math.max(m.revenue, m.expenses)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">Profit &amp; Loss</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
              <ShieldAlert size={11} /> Super Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Revenue = payments actually received. Expenses = requisitions approved and disbursed (status: Completed).
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white self-start sm:self-auto"
        >
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <TrendingUp size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(yearTotals.revenue)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{selectedYear} · payments received</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <TrendingDown size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(yearTotals.expenses)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{selectedYear} · disbursed requisitions</p>
        </div>
        <div className={`rounded-2xl border shadow-xs p-5 ${yearTotals.profit >= 0 ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'}`}>
          <div className={`flex items-center gap-2 mb-2 ${yearTotals.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            <PiggyBank size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">{yearTotals.profit >= 0 ? 'Net Profit' : 'Net Loss'}</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(Math.abs(yearTotals.profit))}</p>
          <p className="text-[11px] text-slate-400 mt-1">{selectedYear} full year</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Monthly Breakdown — {selectedYear}</h2>
        <div className="space-y-2.5">
          {monthlyBreakdown.map(m => (
            <div key={m.month} className="flex items-center gap-3 text-xs">
              <span className="w-8 shrink-0 font-semibold text-slate-500">{MONTH_NAMES[m.month]}</span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${(m.revenue / maxMonthlyValue) * 100}%`, minWidth: m.revenue > 0 ? '2px' : '0' }} />
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{formatCurrency(m.revenue)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 rounded-full bg-rose-400" style={{ width: `${(m.expenses / maxMonthlyValue) * 100}%`, minWidth: m.expenses > 0 ? '2px' : '0' }} />
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{formatCurrency(m.expenses)}</span>
                </div>
              </div>
              <span className={`w-28 shrink-0 text-right font-bold font-mono ${m.revenue - m.expenses >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(m.revenue - m.expenses)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenue</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Expenses</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Quarterly Rollup — {selectedYear}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quarters.map(q => (
            <div key={q.quarter} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Q{q.quarter}</p>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(q.profit)}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Rev {formatCurrency(q.revenue)}</p>
              <p className="text-[10px] text-slate-500">Exp {formatCurrency(q.expenses)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
