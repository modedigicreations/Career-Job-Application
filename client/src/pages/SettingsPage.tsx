import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { getInitials } from '@/lib/utils';
import { RefreshCw, User, Building, Bell, Shield, Database, CheckCircle2 } from 'lucide-react';

function SavedToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
      <CheckCircle2 className="h-4 w-4" /> Changes saved
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser, users, updateUser, resetToSeedData } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'team' | 'notifications' | 'data'>('profile');
  const [profile, setProfile] = useState({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone || '' });
  const [profileError, setProfileError] = useState('');
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

  function saveProfile() {
    setProfileError('');
    const name = profile.name.trim();
    const email = profile.email.trim();
    if (!name) {
      setProfileError('Name is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError('Please enter a valid email address.');
      return;
    }
    updateUser(currentUser.id, { name, email, phone: profile.phone.trim() });
    showSaved();
  }

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'company' as const, label: 'Company', icon: Building },
    { key: 'team' as const, label: 'Team', icon: Shield },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
    { key: 'data' as const, label: 'Data', icon: Database },
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
              onClick={() => setActiveTab(tab.key)}
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
            <div><label className="label">Email</label><input className="input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
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
          <button className="btn-primary" onClick={saveProfile}>Save Changes</button>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-brand-100 text-brand-700 capitalize">{user.role}</span>
                  <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
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

      {activeTab === 'data' && (
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-sm font-semibold text-amber-800 mb-1">Reset Demo Data</h4>
            <p className="text-sm text-amber-700 mb-3">This will reset all data to the default demo state. This action cannot be undone.</p>
            <button onClick={() => { if (confirm('Reset all data to demo state? This cannot be undone.')) resetToSeedData(); }} className="btn-danger">
              <RefreshCw className="h-4 w-4 mr-2" /> Reset to Demo Data
            </button>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Storage</h4>
            <p className="text-sm text-gray-600">Data is stored locally in your browser using localStorage. No server connection required for the demo.</p>
          </div>
        </div>
      )}
    </div>
  );
}
