import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { getInitials, formatDate, MANAGER_TIER } from '@/lib/utils';
import { ApiError, api } from '@/lib/api';
import { User as UserIcon, Building, Bell, Shield, CheckCircle2, Plus, History, Zap } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import type { User, LoginHistoryEntry } from '@/types';

const ROLE_OPTIONS = ['super-admin', 'admin', 'manager', 'sales', 'support', 'developer'];
function SavedToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
      <CheckCircle2 className="h-4 w-4" /> Changes saved
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser, users, updateUser, addStaff } = useStore();
  const canManageStaff = MANAGER_TIER.includes(currentUser.role);
  const canManageIntegrations = currentUser.role === 'admin' || currentUser.role === 'super-admin';
  // Matches the server's GET /auth/login-history rule — only admin/super-admin can view
  // someone else's history. 'manager' doesn't qualify there even though it's manager-tier.
  const canViewOthersHistory = canManageIntegrations;
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'team' | 'notifications' | 'integrations'>('profile');
  const [integrations, setIntegrations] = useState({ baseUrl: '', hasApiKey: false, apiKeyInput: '' });
  const [integrationsLoaded, setIntegrationsLoaded] = useState(false);
  const [savingIntegrations, setSavingIntegrations] = useState(false);
  const [profile, setProfile] = useState({ name: currentUser.name, phone: currentUser.phone || '' });
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'sales', phone: '' });
  const [staffError, setStaffError] = useState('');
  const [historyUser, setHistoryUser] = useState<{ id: string; name: string } | null>(null);
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [company, setCompany] = useState({ name: 'MODE Digital Creations', website: 'modedigitalcreations.ng', email: 'admin@modedigitalcreations.ng', phone: '+234 801 234 5678', address: 'Lagos, Nigeria', currency: 'NGN' });
  const [notifications, setNotifications] = useState({
    newLeads: true, dealChanges: true, invoicePayments: true,
    domainExpiry: true, ticketUpdates: true, weeklyReport: true,
  });
  const [saved, setSaved] = useState(false);

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function saveProfile() {
    setProfileError('');
    const name = profile.name.trim();
    if (!name) {
      setProfileError('Name is required.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateUser(currentUser.id, { name, phone: profile.phone.trim() });
      showSaved();
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Failed to save changes.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setStaffError('');
    try {
      await addStaff(staffForm);
      showToast(`${staffForm.name} added`);
      setShowAddStaff(false);
      setStaffForm({ name: '', email: '', password: '', role: 'sales', phone: '' });
    } catch (err) {
      setStaffError(err instanceof ApiError ? err.message : 'Failed to add staff member');
    }
  }

  async function handleRoleChange(id: string, role: string) {
    try {
      await updateUser(id, { role: role as User['role'] });
      showToast('Role updated');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update role', 'error');
    }
  }

  async function handleActiveToggle(id: string, isActive: boolean) {
    try {
      await updateUser(id, { isActive });
      showToast(isActive ? 'Account activated' : 'Account deactivated');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update account', 'error');
    }
  }

  async function openHistory(user: { id: string; name: string }) {
    setHistoryUser(user);
    setHistoryLoading(true);
    try {
      const data = await api.get<LoginHistoryEntry[]>(`/auth/login-history?userId=${user.id}`);
      setHistory(data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to load login history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  }

  async function loadIntegrations() {
    if (integrationsLoaded) return;
    try {
      const data = await api.get<{ baseUrl: string; hasApiKey: boolean }>('/settings/integrations');
      setIntegrations({ baseUrl: data.baseUrl, hasApiKey: data.hasApiKey, apiKeyInput: '' });
      setIntegrationsLoaded(true);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to load integration settings', 'error');
    }
  }

  async function saveIntegrations() {
    setSavingIntegrations(true);
    try {
      await api.put('/settings/integrations', { baseUrl: integrations.baseUrl, apiKey: integrations.apiKeyInput || undefined });
      setIntegrations({ ...integrations, hasApiKey: integrations.hasApiKey || !!integrations.apiKeyInput, apiKeyInput: '' });
      showSaved();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to save integration settings', 'error');
    } finally {
      setSavingIntegrations(false);
    }
  }

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: UserIcon },
    { key: 'company' as const, label: 'Company', icon: Building },
    { key: 'team' as const, label: 'Team', icon: Shield },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
    ...(canManageIntegrations ? [{ key: 'integrations' as const, label: 'Integrations', icon: Zap }] : []),
  ];

  const notificationItems = [
    { key: 'newLeads' as const, label: 'New lead notifications', desc: 'Get notified when a new lead is captured' },
    { key: 'dealChanges' as const, label: 'Deal stage changes', desc: 'Notifications when deals move through pipeline' },
    { key: 'invoicePayments' as const, label: 'Invoice payments', desc: 'Alert when a payment is received' },
    { key: 'domainExpiry' as const, label: 'Domain expiry reminders', desc: 'Get reminded before domains expire' },
    { key: 'ticketUpdates' as const, label: 'Support ticket updates', desc: 'Notifications for new and updated tickets' },
    { key: 'weeklyReport' as const, label: 'Weekly performance report', desc: 'Receive a weekly summary email' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <SavedToast show={saved} />

      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); if (tab.key === 'integrations') loadIntegrations(); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xl font-bold">
              {getInitials(profile.name)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{currentUser.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="label">Full Name</label><input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
            <div>
              <label className="label">Email</label>
              <input className="input bg-gray-50" type="email" value={currentUser.email} disabled title="Contact an admin to change your login email" />
            </div>
            <div><label className="label">Phone</label><input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
            <div>
              <label className="label">Role</label>
              <input className="input bg-gray-50" value={currentUser.role} disabled />
            </div>
          </div>
          {profileError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{profileError}</p>
            </div>
          )}
          <button className="btn-primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
        </div>
      )}

      {activeTab === 'company' && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="label">Company Name</label><input className="input" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></div>
            <div><label className="label">Website</label><input className="input" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} /></div>
            <div><label className="label">Email</label><input className="input" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Address</label><textarea className="input" rows={2} value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div>
          </div>
          <div>
            <label className="label">Default Currency</label>
            <select className="input w-auto" value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })}>
              <option value="NGN">NGN (Nigerian Naira)</option>
              <option value="GBP">GBP (British Pound)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
          <button className="btn-primary" onClick={showSaved}>Save Changes</button>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            {canManageStaff && (
              <button onClick={() => setShowAddStaff(true)} className="btn-primary text-xs py-1.5"><Plus className="h-3.5 w-3.5 mr-1" /> Add Staff</button>
            )}
          </div>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.lastLoginAt ? `Last login ${formatDate(user.lastLoginAt)}` : 'Never logged in'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canManageStaff ? (
                    <select
                      className="input w-auto text-xs py-1"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.role === 'super-admin' && currentUser.role !== 'super-admin'}
                    >
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r} disabled={r === 'super-admin' && currentUser.role !== 'super-admin'}>{r}</option>)}
                    </select>
                  ) : (
                    <span className="badge bg-brand-100 text-brand-700 capitalize">{user.role}</span>
                  )}
                  {canManageStaff ? (
                    <button
                      onClick={() => handleActiveToggle(user.id, !user.isActive)}
                      className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  ) : (
                    <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                  {(canViewOthersHistory || user.id === currentUser.id) && (
                    <button onClick={() => openHistory(user)} title="View login history" className="p-1.5 rounded hover:bg-gray-100">
                      <History className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          {notificationItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-brand-500 peer-focus:ring-2 peer-focus:ring-brand-500/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          ))}
          <button className="btn-primary" onClick={showSaved}>Save Preferences</button>
        </div>
      )}

      {activeTab === 'integrations' && canManageIntegrations && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp Broadcast (WATI)</h3>
          <p className="text-sm text-gray-500">
            Connect a WATI account to send WhatsApp broadcasts from Leads and Contacts. Until these are filled in, broadcasts will fail with a clear error.
          </p>
          <div><label className="label">WATI Base URL</label><input className="input" placeholder="https://live-mt-server.wati.io/12345" value={integrations.baseUrl} onChange={(e) => setIntegrations({ ...integrations, baseUrl: e.target.value })} /></div>
          <div>
            <label className="label">API Key {integrations.hasApiKey && <span className="text-xs text-green-600 font-normal">(currently set — leave blank to keep it)</span>}</label>
            <input className="input" type="password" placeholder={integrations.hasApiKey ? '••••••••••••' : 'Paste WATI API key'} value={integrations.apiKeyInput} onChange={(e) => setIntegrations({ ...integrations, apiKeyInput: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={saveIntegrations} disabled={savingIntegrations}>{savingIntegrations ? 'Saving...' : 'Save Integration'}</button>
        </div>
      )}

      <Modal isOpen={showAddStaff} onClose={() => setShowAddStaff(false)} title="Add Staff Member">
        <form onSubmit={handleAddStaff} className="space-y-4">
          {staffError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{staffError}</p>
            </div>
          )}
          <div><label className="label">Full Name *</label><input required className="input" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} /></div>
          <div><label className="label">Email *</label><input required type="email" className="input" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} /></div>
          <div><label className="label">Temporary Password *</label><input required type="password" minLength={8} className="input" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} /></div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
              {ROLE_OPTIONS.filter((r) => r !== 'super-admin' || currentUser.role === 'super-admin').map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddStaff(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Staff</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!historyUser} onClose={() => setHistoryUser(null)} title={`Login History — ${historyUser?.name ?? ''}`}>
        {historyLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500">No login history yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {history.map((h) => (
              <div key={h.id} className="py-2 text-sm text-gray-700">{new Date(h.loggedInAt).toLocaleString()}</div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
