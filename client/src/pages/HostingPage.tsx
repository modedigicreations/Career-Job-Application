import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate, getDaysUntil, cn } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Search, Server, AlertTriangle, Shield, ShieldCheck, ShieldX } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import type { HostingAccount, HostingPlan, Currency } from '@/types';

const emptyAccount: Omit<HostingAccount, 'id'> = {
  clientId: '', clientName: '', domainName: '', registrationDate: '', expiryDate: '',
  hostingPlan: 'starter', sslStatus: 'none', autoRenew: false, status: 'active',
  monthlyFee: 0, currency: 'NGN',
};

export default function HostingPage() {
  const { hostingAccounts, addHostingAccount, updateHostingAccount, deleteHostingAccount } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HostingAccount | null>(null);
  const [form, setForm] = useState(emptyAccount);

  const filtered = useMemo(() => {
    if (!search) return hostingAccounts;
    const q = search.toLowerCase();
    return hostingAccounts.filter((h) => h.domainName.toLowerCase().includes(q) || h.clientName.toLowerCase().includes(q));
  }, [hostingAccounts, search]);

  const expiringAccounts = hostingAccounts.filter((h) => {
    const days = getDaysUntil(h.expiryDate);
    return days <= 90 && days > -30;
  });

  function openCreate() { setEditing(null); setForm(emptyAccount); setShowForm(true); }
  function openEdit(account: HostingAccount) { setEditing(account); setForm(account); setShowForm(true); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateHostingAccount(editing.id, form);
    } else {
      addHostingAccount({ ...form, id: uuid() } as HostingAccount);
    }
    setShowForm(false);
  }

  const SSLIcons = { active: ShieldCheck, expired: ShieldX, none: Shield };

  return (
    <div className="space-y-6">
      {expiringAccounts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-amber-800">Renewal Alerts</h3>
          </div>
          <div className="space-y-1">
            {expiringAccounts.map((account) => {
              const days = getDaysUntil(account.expiryDate);
              return (
                <p key={account.id} className="text-sm text-amber-700">
                  <strong>{account.domainName}</strong> ({account.clientName}) expires in <strong>{days} days</strong> ({formatDate(account.expiryDate)})
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search domains..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> Add Account</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Server} title="No hosting accounts" description="Add hosting accounts to track domains and renewals." action={<button onClick={openCreate} className="btn-primary">Add Account</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header px-4 py-3">Domain</th>
                  <th className="table-header px-4 py-3">Client</th>
                  <th className="table-header px-4 py-3">Plan</th>
                  <th className="table-header px-4 py-3">SSL</th>
                  <th className="table-header px-4 py-3">Registered</th>
                  <th className="table-header px-4 py-3">Expires</th>
                  <th className="table-header px-4 py-3">Days Left</th>
                  <th className="table-header px-4 py-3">Monthly Fee</th>
                  <th className="table-header px-4 py-3">Status</th>
                  <th className="table-header px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((account) => {
                  const daysLeft = getDaysUntil(account.expiryDate);
                  const SSLIcon = SSLIcons[account.sslStatus];
                  return (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{account.domainName}</p>
                        {account.autoRenew && <span className="text-[10px] text-green-600 font-medium">Auto-renew</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{account.clientName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{account.hostingPlan}</td>
                      <td className="px-4 py-3">
                        <SSLIcon className={cn('h-4 w-4', account.sslStatus === 'active' ? 'text-green-500' : account.sslStatus === 'expired' ? 'text-red-500' : 'text-gray-400')} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(account.registrationDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(account.expiryDate)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-sm font-medium', daysLeft <= 7 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : daysLeft <= 90 ? 'text-yellow-600' : 'text-green-600')}>
                          {daysLeft <= 0 ? 'Expired' : `${daysLeft}d`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(account.monthlyFee, account.currency)}</td>
                      <td className="px-4 py-3"><StatusBadge status={account.status} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => openEdit(account)} className="text-xs text-brand-500 hover:text-brand-700 font-medium">Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Hosting Account' : 'Add Hosting Account'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="label">Domain Name *</label><input required className="input" value={form.domainName} onChange={(e) => setForm({ ...form, domainName: e.target.value })} /></div>
            <div><label className="label">Client Name *</label><input required className="input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
            <div><label className="label">Registration Date</label><input type="date" className="input" value={form.registrationDate} onChange={(e) => setForm({ ...form, registrationDate: e.target.value })} /></div>
            <div><label className="label">Expiry Date *</label><input required type="date" className="input" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
            <div>
              <label className="label">Hosting Plan</label>
              <select className="input" value={form.hostingPlan} onChange={(e) => setForm({ ...form, hostingPlan: e.target.value as HostingPlan })}>
                <option value="starter">Starter</option><option value="business">Business</option><option value="enterprise">Enterprise</option><option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="label">SSL Status</label>
              <select className="input" value={form.sslStatus} onChange={(e) => setForm({ ...form, sslStatus: e.target.value as any })}>
                <option value="active">Active</option><option value="expired">Expired</option><option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
                <option value="NGN">NGN</option><option value="GBP">GBP</option><option value="USD">USD</option>
              </select>
            </div>
            <div><label className="label">Monthly Fee</label><input type="number" className="input" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })} /></div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" id="autoRenew" checked={form.autoRenew} onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })} /><label htmlFor="autoRenew" className="text-sm text-gray-700">Auto-renew</label></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
