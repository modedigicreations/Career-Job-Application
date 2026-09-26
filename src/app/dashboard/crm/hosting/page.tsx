'use client';

import React, { useState } from 'react';
import {
  Globe,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils';

export default function HostingPage() {
  const { hostingAccounts, renewHosting } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  const filteredAccounts = hostingAccounts.filter(h => {
    if (searchTerm && !h.domainName.toLowerCase().includes(searchTerm.toLowerCase()) && !h.clientName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterPlan !== 'all' && h.hostingPlan !== filterPlan) return false;
    return true;
  });

  const totalMonthlyMrr = hostingAccounts
    .filter(h => h.status === 'active')
    .reduce((acc, curr) => acc + curr.monthlyFee, 0);

  const urgentRenewals = hostingAccounts.filter(h => getDaysUntil(h.expiryDate) <= 30);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Client Domains & Hosting Management
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {hostingAccounts.length} Managed Domains
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated SSL tracking, expiry warning milestones (90/30/7/1 days), and hosting renewal vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Hosting MRR</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {formatCurrency(totalMonthlyMrr, 'NGN')} / mo
            </span>
          </div>
        </div>
      </div>

      {/* Urgent Warning Banner if any renewals within 30 days */}
      {urgentRenewals.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-900">
                {urgentRenewals.length} Domain(s) Expiring Within 30 Days!
              </span>
              <p className="text-amber-700 text-[11px] mt-0.5">
                {urgentRenewals.map(u => u.domainName).join(', ')} require renewal confirmation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search domain or client..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Domain Name</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">SSL Status</th>
                <th className="py-3 px-4">Monthly Fee</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Urgency Badge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map(h => {
                const daysLeft = getDaysUntil(h.expiryDate);
                const isUrgent = daysLeft <= 30;
                return (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Globe size={14} className="text-blue-600" />
                        <span>{h.domainName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {h.clientName}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-mono text-[11px] text-slate-600">
                      {h.hostingPlan}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <ShieldCheck size={14} />
                        <span>Active SSL</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(h.monthlyFee, h.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {formatDate(h.expiryDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        daysLeft <= 15
                          ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                          : daysLeft <= 45
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => renewHosting(h.id, 12)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-[#0D52F8] text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition cursor-pointer"
                        title="Renew domain and hosting for 1 year"
                      >
                        <RefreshCw size={11} />
                        <span>Renew (1 Yr)</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
