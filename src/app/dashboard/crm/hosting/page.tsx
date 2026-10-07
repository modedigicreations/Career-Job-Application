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
  ExternalLink,
  Server,
  Key,
  Check,
  X,
  Zap,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils';

export default function HostingPage() {
  const {
    hostingAccounts,
    renewHosting,
    whmcsConfig,
    updateWhmcsConfig,
    syncWhmcsHosting
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'urgent' | 'critical' | 'active' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'expiry_asc' | 'expiry_desc' | 'domain_asc' | 'fee_desc'>('expiry_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; title: string; message: string; detectedIp?: string } | null>(null);
  const [isWhmcsModalOpen, setIsWhmcsModalOpen] = useState(false);

  // WHMCS Config Modal Form State
  const [modalApiUrl, setModalApiUrl] = useState(whmcsConfig.apiUrl || 'https://billing.modewebhost.com');
  const [modalIdentifier, setModalIdentifier] = useState(whmcsConfig.identifier || '');
  const [modalSecret, setModalSecret] = useState(whmcsConfig.secret && whmcsConfig.secret !== '••••••••••••••••' ? whmcsConfig.secret : '');
  const [modalAuthMethod, setModalAuthMethod] = useState<'api_credentials' | 'admin_login'>('api_credentials');
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; detectedIp?: string } | null>(null);
  const [copiedIp, setCopiedIp] = useState(false);

  const urgentRenewals = hostingAccounts.filter(h => getDaysUntil(h.expiryDate) <= 30 && getDaysUntil(h.expiryDate) >= 0);
  const criticalRenewals = hostingAccounts.filter(h => getDaysUntil(h.expiryDate) <= 7 && getDaysUntil(h.expiryDate) >= 0);
  const expiredAccounts = hostingAccounts.filter(h => getDaysUntil(h.expiryDate) < 0);
  const hasLiveAccounts = hostingAccounts.some(h => h.isWhmcsLive);

  // Filter accounts
  const filteredAccounts = hostingAccounts.filter(h => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchDomain = h.domainName.toLowerCase().includes(q);
      const matchClient = h.clientName.toLowerCase().includes(q);
      const matchRegistrar = (h.registrar || '').toLowerCase().includes(q);
      if (!matchDomain && !matchClient && !matchRegistrar) return false;
    }
    if (filterPlan !== 'all' && h.hostingPlan !== filterPlan) return false;

    const daysLeft = getDaysUntil(h.expiryDate);
    if (filterUrgency === 'urgent' && (daysLeft > 30 || daysLeft < 0)) return false;
    if (filterUrgency === 'critical' && (daysLeft > 7 || daysLeft < 0)) return false;
    if (filterUrgency === 'active' && daysLeft < 0) return false;
    if (filterUrgency === 'expired' && daysLeft >= 0) return false;

    return true;
  });

  // Sort accounts
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortBy === 'expiry_asc') {
      return getDaysUntil(a.expiryDate) - getDaysUntil(b.expiryDate);
    }
    if (sortBy === 'expiry_desc') {
      return getDaysUntil(b.expiryDate) - getDaysUntil(a.expiryDate);
    }
    if (sortBy === 'domain_asc') {
      return a.domainName.localeCompare(b.domainName);
    }
    if (sortBy === 'fee_desc') {
      return b.monthlyFee - a.monthlyFee;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedAccounts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedAccounts = sortedAccounts.slice(startIndex, startIndex + pageSize);

  const totalMonthlyMrr = hostingAccounts
    .filter(h => h.status === 'active')
    .reduce((acc, curr) => acc + curr.monthlyFee, 0);

  const handleSyncWhmcs = async (overrideCreds?: { apiUrl?: string; identifier?: string; secret?: string }) => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await syncWhmcsHosting(overrideCreds);
      if (res.success) {
        setSyncNotice({
          type: 'success',
          title: 'WHMCS Synchronized',
          message: res.message || `Successfully synced ${res.count} live domains and hosting accounts.`
        });
      } else {
        setSyncNotice({
          type: 'error',
          title: 'WHMCS Sync Failed',
          message: res.message || 'Unable to fetch data from WHMCS. Check your API credentials and IP restrictions.',
          detectedIp: res.detectedIp
        });
      }
    } catch (err: any) {
      setSyncNotice({
        type: 'error',
        title: 'Connection Error',
        message: err?.message || 'Unable to connect to WHMCS server.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    if (!modalApiUrl || !modalIdentifier || !modalSecret) {
      setTestResult({
        success: false,
        message: 'Please fill in the WHMCS URL, Identifier/Username, and Secret/Password.'
      });
      return;
    }

    setIsTestingConn(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whmcs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: modalApiUrl,
          identifier: modalIdentifier,
          secret: modalSecret,
          authMethod: modalAuthMethod,
          isTestOnly: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Connection verified! WHMCS API responded successfully.'
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || data.error || 'Authentication failed. Please check your credentials.',
          detectedIp: data.detectedIp
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network request failed when contacting WHMCS endpoint.'
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 3000);
  };

  const handleSaveWhmcsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    updateWhmcsConfig({
      apiUrl: modalApiUrl,
      identifier: modalIdentifier,
      secret: modalSecret,
      isConnected: true,
    });
    setIsWhmcsModalOpen(false);
    // Pass the just-typed values directly rather than relying on the updateWhmcsConfig
    // state update above having applied yet — setState is async, so without this the sync
    // below would run against last render's (possibly empty) whmcsConfig, not what was
    // just entered and tested.
    handleSyncWhmcs({ apiUrl: modalApiUrl, identifier: modalIdentifier, secret: modalSecret });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Client Domains & Hosting Management
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {hostingAccounts.length} Managed Domains
            </span>
            {hasLiveAccounts ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                WHMCS Live Sync: Active
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                WHMCS: Demo Dataset Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated WHMCS client hosting sync, SSL tracking, expiry warning milestones, and renewal management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="p-2.5 px-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Hosting MRR</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {formatCurrency(totalMonthlyMrr, 'NGN')} / mo
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleSyncWhmcs()}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-mode-royal hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            title="Fetch latest domain and hosting renewals from WHMCS API"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync WHMCS'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsWhmcsModalOpen(true);
              setTestResult(null);
            }}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Configure WHMCS API connection settings"
          >
            <Server size={14} className="text-purple-600" />
            <span className="hidden sm:inline">WHMCS API</span>
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncNotice && (
        <div className={`p-4 rounded-xl border text-xs font-medium flex items-start justify-between animate-in fade-in duration-200 ${
          syncNotice.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-start gap-2.5">
            {syncNotice.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-xs">{syncNotice.title}</div>
              <div className="mt-0.5 text-[11px] leading-relaxed opacity-90">{syncNotice.message}</div>
              {syncNotice.detectedIp && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-white/90 border border-rose-300 text-rose-950 font-mono text-[11px] flex items-center justify-between gap-2">
                  <span>Server IP to Whitelist: <strong>{syncNotice.detectedIp}</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(syncNotice.detectedIp!)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-sans text-[10px] font-bold transition"
                  >
                    {copiedIp ? 'Copied!' : 'Copy IP'}
                  </button>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setSyncNotice(null)} className="p-1 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Clean Renewal Executive Banner */}
      {urgentRenewals.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-300/40">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-950 text-sm">
                  {urgentRenewals.length} Domain(s) Expiring Within 30 Days
                </span>
                {criticalRenewals.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full text-[10px] font-bold animate-pulse">
                    {criticalRenewals.length} Critical (≤ 7 Days)
                  </span>
                )}
              </div>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Proactively follow up with clients for renewal confirmation and invoice generation before domain expiration.
              </p>
              {/* Soonest expiring preview pills */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-amber-700 font-semibold">Soonest:</span>
                {urgentRenewals.slice(0, 4).map(u => (
                  <span key={u.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 border border-amber-200 rounded-md text-[10px] font-mono text-amber-900 font-medium">
                    <Globe size={10} className="text-amber-600" />
                    <span>{u.domainName}</span>
                    <span className="text-amber-600 font-sans font-bold">({getDaysUntil(u.expiryDate)}d)</span>
                  </span>
                ))}
                {urgentRenewals.length > 4 && (
                  <span className="text-[10px] text-amber-700 font-medium italic">
                    +{urgentRenewals.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => {
                if (filterUrgency === 'urgent') {
                  setFilterUrgency('all');
                } else {
                  setFilterUrgency('urgent');
                  setCurrentPage(1);
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                filterUrgency === 'urgent'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/70'
              }`}
            >
              <Filter size={12} />
              <span>{filterUrgency === 'urgent' ? 'Showing Urgent Only' : `Filter Urgent (${urgentRenewals.length})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter, Search & Sorting Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search 400+ domains, clients, registrars..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'urgent', label: `Urgent (≤30d)` },
                { id: 'critical', label: `Critical (≤7d)` },
                { id: 'active', label: 'Active' },
                { id: 'expired', label: 'Expired' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterUrgency(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  filterUrgency === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hosting Plan Filter */}
          <select
            value={filterPlan}
            onChange={e => {
              setFilterPlan(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Hosting Plans</option>
            <option value="starter">Starter Plan</option>
            <option value="business">Business Plan</option>
            <option value="enterprise">Enterprise Plan</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value as any);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="expiry_asc">Sort: Soonest Expiry</option>
            <option value="expiry_desc">Sort: Furthest Expiry</option>
            <option value="domain_asc">Sort: Domain A-Z</option>
            <option value="fee_desc">Sort: Highest Fee</option>
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none cursor-pointer font-medium"
            title="Items per page"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Domain Name</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">SSL Status</th>
                <th className="py-3 px-4">Renewal Fee</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Globe size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No domains match your search or filter</p>
                    <p className="text-[11px] mt-0.5">Try clearing filters or search keywords</p>
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map(h => {
                  const daysLeft = getDaysUntil(h.expiryDate);
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Globe size={14} className="text-blue-600 shrink-0" />
                          <span className="font-mono text-xs">{h.domainName}</span>
                          {h.isWhmcsLive && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              WHMCS
                            </span>
                          )}
                        </div>
                        {h.registrar && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Registrar: {h.registrar}
                          </div>
                        )}
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
                          daysLeft < 0
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : daysLeft <= 7
                            ? 'bg-red-50 text-red-700 border-red-200 animate-pulse font-extrabold'
                            : daysLeft <= 30
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {daysLeft < 0
                            ? 'Expired'
                            : daysLeft === 0
                            ? 'Due Today'
                            : `${daysLeft} days left`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Confirm renewal of ${h.domainName} (${h.clientName}) for 1 year? The expiry date will move forward 12 months.`)) {
                              renewHosting(h.id, 12);
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-mode-royal text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                          title="Renew domain and hosting for 1 year"
                        >
                          <RefreshCw size={11} />
                          <span>Renew (1 Yr)</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Navigation Footer */}
        {sortedAccounts.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="font-medium">
              Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-slate-900">
                {Math.min(startIndex + pageSize, sortedAccounts.length)}
              </span>{' '}
              of <span className="font-bold text-slate-900">{sortedAccounts.length}</span> domains
              {sortedAccounts.length !== hostingAccounts.length && (
                <span className="text-slate-400"> (filtered from {hostingAccounts.length} total)</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1 font-semibold"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>

              <div className="px-3 py-1 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
                Page {safeCurrentPage} of {totalPages}
              </div>

              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1 font-semibold"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WHMCS Connection Configuration Modal */}
      {isWhmcsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsWhmcsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Server size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">WHMCS Live Hosting Integration</h2>
                  <p className="text-[10px] text-slate-500">Connect to WHMCS API for automated live renewals</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWhmcsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWhmcsConfig} className="space-y-3.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-semibold text-slate-800 block text-xs">Connection Method</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  You can connect using either your <strong>WHMCS Admin Login</strong> (Username + Password) or modern <strong>API Credentials</strong> (Identifier + Secret).
                </p>
                <div className="flex gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setModalAuthMethod('api_credentials');
                      setTestResult(null);
                    }}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border transition ${
                      modalAuthMethod === 'api_credentials'
                        ? 'bg-purple-50 text-purple-700 border-purple-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    API Credentials
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalAuthMethod('admin_login');
                      setTestResult(null);
                    }}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border transition ${
                      modalAuthMethod === 'admin_login'
                        ? 'bg-purple-50 text-purple-700 border-purple-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Admin Login
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">WHMCS System URL *</label>
                <input
                  type="text"
                  required
                  value={modalApiUrl}
                  onChange={e => {
                    setModalApiUrl(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="https://billing.modewebhost.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Root or billing URL (e.g. https://billing.modewebhost.com or https://yourdomain.com/whmcs)
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {modalAuthMethod === 'admin_login' ? 'WHMCS Admin Username *' : 'API Identifier *'}
                </label>
                <input
                  type="text"
                  required
                  value={modalIdentifier}
                  onChange={e => {
                    setModalIdentifier(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={modalAuthMethod === 'admin_login' ? 'e.g. admin or your WHMCS username' : 'e.g. API Identifier key'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {modalAuthMethod === 'admin_login' ? 'WHMCS Admin Password *' : 'API Secret Key *'}
                </label>
                <input
                  type="password"
                  required
                  value={modalSecret}
                  onChange={e => {
                    setModalSecret(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={modalAuthMethod === 'admin_login' ? 'Enter WHMCS admin password' : 'Enter WHMCS API secret key'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Test Result Display */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-[11px] font-medium leading-relaxed ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block">{testResult.success ? 'Connection Successful' : 'Connection Failed'}</span>
                      <span>{testResult.message}</span>
                      {testResult.detectedIp && (
                        <div className="mt-2.5 p-2 rounded-lg bg-white/90 border border-rose-300 text-rose-950 font-mono text-[11px] flex items-center justify-between gap-2">
                          <span>Server IP: <strong>{testResult.detectedIp}</strong></span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(testResult.detectedIp!)}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-sans text-[10px] font-bold transition"
                          >
                            {copiedIp ? 'Copied!' : 'Copy IP'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConn || !modalApiUrl || !modalIdentifier || !modalSecret}
                  className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={12} className={isTestingConn ? 'animate-spin' : ''} />
                  <span>{isTestingConn ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWhmcsModalOpen(false)}
                    className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition text-xs cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Connect & Sync</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
