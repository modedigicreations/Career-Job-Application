'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  ShieldCheck,
  Check,
  Save,
  Database,
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  MessageCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { isManagementUser } from '@/lib/utils';

export default function SettingsPage() {
  const { currentUser, updateUserProfile, users, changeUserPassword } = useAppStore();
  const canManageIntegrations = isManagementUser(currentUser.role);

  const [watiApiUrl, setWatiApiUrl] = useState('');
  const [watiApiKey, setWatiApiKey] = useState('');
  const [watiConfigured, setWatiConfigured] = useState(false);
  const [watiLoading, setWatiLoading] = useState(false);
  const [watiSaving, setWatiSaving] = useState(false);
  const [watiSaved, setWatiSaved] = useState(false);
  const [watiError, setWatiError] = useState('');

  React.useEffect(() => {
    if (!canManageIntegrations) return;
    setWatiLoading(true);
    fetch('/api/settings/integrations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWatiApiUrl(data.watiApiUrl || '');
          setWatiConfigured(!!data.watiConfigured);
        }
      })
      .catch(() => {})
      .finally(() => setWatiLoading(false));
  }, [canManageIntegrations]);

  const handleSaveWati = async (e: React.FormEvent) => {
    e.preventDefault();
    setWatiError('');
    setWatiSaving(true);
    try {
      const res = await fetch('/api/settings/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watiApiUrl, watiApiKey })
      });
      const data = await res.json();
      if (!data.success) {
        setWatiError(data.message || 'Failed to save.');
        return;
      }
      setWatiApiUrl(data.watiApiUrl || '');
      setWatiConfigured(!!data.watiConfigured);
      setWatiApiKey('');
      setWatiSaved(true);
      setTimeout(() => setWatiSaved(false), 3000);
    } catch {
      setWatiError('Failed to reach the server.');
    } finally {
      setWatiSaving(false);
    }
  };
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!currentPwInput) {
      setPwError('Enter your current password.');
      return;
    }
    if (newPwInput !== confirmPwInput) {
      setPwError('New passwords do not match.');
      return;
    }
    if (newPwInput.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }
    setChangingPw(true);
    const result = await changeUserPassword(newPwInput, undefined, currentPwInput);
    setChangingPw(false);
    if (!result.success) {
      setPwError(result.message);
      return;
    }
    setCurrentPwInput('');
    setNewPwInput('');
    setConfirmPwInput('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 3000);
  };
  const [companyName, setCompanyName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mode_ops_company_name') || 'MODE Digital Creations';
    }
    return 'MODE Digital Creations';
  });
  const [defaultCurrency, setDefaultCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mode_ops_base_currency') || 'NGN';
    }
    return 'NGN';
  });
  
  // Executive profile fields
  const [execName, setExecName] = useState(currentUser.full_name || 'Davids Ogan');
  const [execEmail, setExecEmail] = useState(currentUser.email || 'info@modedigitalcreations.ng');
  const [execTitle, setExecTitle] = useState(currentUser.job_title || 'Managing Director & Founder');
  const [execPhone, setExecPhone] = useState(currentUser.phone || '+234 801 234 5678');

  React.useEffect(() => {
    if (currentUser) {
      setExecName(currentUser.full_name || '');
      setExecEmail(currentUser.email || '');
      setExecTitle(currentUser.job_title || '');
      setExecPhone(currentUser.phone || '');
    }
  }, [currentUser]);
  
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update active executive profile
    updateUserProfile(currentUser.id, {
      full_name: execName,
      email: execEmail,
      job_title: execTitle,
      phone: execPhone,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('mode_ops_base_currency', defaultCurrency);
      localStorage.setItem('mode_ops_company_name', companyName);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
            System & Enterprise Settings
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            mode-ops v2.0
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Company profile, Managing Director identity, multi-currency defaults, and Supabase database status.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Executive Managing Director Profile */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Managing Director & Executive Identity</h2>
            <p className="text-slate-500 mb-3">Super Admin credentials shown across company vouchers, approvals, and executive cockpit.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Managing Director Full Name *</label>
                <input
                  type="text"
                  required
                  value={execName}
                  onChange={e => setExecName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Executive Email Address *</label>
                <input
                  type="email"
                  required
                  value={execEmail}
                  onChange={e => setExecEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  value={execTitle}
                  onChange={e => setExecTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={execPhone}
                  onChange={e => setExecPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Company Profile & Branding</h2>
            <p className="text-slate-500 mb-3">Appears on invoices, vouchers, and client proposals.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organization Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Base Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={e => setDefaultCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 cursor-not-allowed"
                  disabled
                >
                  <option value="NGN">Nigerian Naira (NGN ₦ - Standard Company Currency)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Database & Storage Status</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Server-side JSON store</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Data currently lives in <code className="font-mono text-blue-600">data/mode-ops-db.json</code> on the server, synced to every browser in real time.
                A Postgres schema is prepared at <code className="font-mono text-blue-600">supabase/schema.sql</code> for a future migration, but the app does not
                read or write to Supabase yet. This file needs a persistent volume on your host (e.g. Railway) to survive redeploys.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {saved ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check size={14} /> Profile & Settings Saved
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 bg-mode-royal hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Save size={14} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {canManageIntegrations && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <MessageCircle size={14} className="text-slate-500" /> WhatsApp Broadcast (WATI)
          </h2>
          <p className="text-slate-500 mb-3 text-xs">
            Connect a WATI account to send WhatsApp broadcasts to leads and contacts from the CRM.
            The API key is stored server-side only and is never sent back to the browser once saved.
          </p>

          <form onSubmit={handleSaveWati} className="space-y-3 text-xs max-w-lg">
            {watiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{watiError}</span>
              </div>
            )}
            {watiSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
                <Check size={14} className="shrink-0" />
                <span>Integration settings saved.</span>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">WATI API Endpoint</label>
              <input
                type="text"
                value={watiApiUrl}
                onChange={e => setWatiApiUrl(e.target.value)}
                placeholder="https://live-mt-server.wati.io/000000"
                disabled={watiLoading}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                WATI Authorization Token {watiConfigured && <span className="text-emerald-600 font-normal">(already set — leave blank to keep it)</span>}
              </label>
              <input
                type="password"
                value={watiApiKey}
                onChange={e => setWatiApiKey(e.target.value)}
                placeholder={watiConfigured ? '••••••••••••••••' : 'Bearer ey...'}
                disabled={watiLoading}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`text-[11px] font-semibold ${watiConfigured ? 'text-emerald-600' : 'text-slate-400'}`}>
                {watiConfigured ? '● Connected' : '○ Not configured'}
              </span>
              <button
                type="submit"
                disabled={watiSaving || watiLoading}
                className="px-4 py-2 bg-mode-royal hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Save size={13} />
                <span>{watiSaving ? 'Saving...' : 'Save Integration'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
          <Lock size={14} className="text-slate-500" /> Change My Password
        </h2>
        <p className="text-slate-500 mb-3 text-xs">Only you can change your own password here. To reset someone else's, a manager or admin can do that from Staff Allocation.</p>

        <form onSubmit={handleChangePassword} className="space-y-3 text-xs max-w-md">
          {pwError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{pwError}</span>
            </div>
          )}
          {pwSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
              <Check size={14} className="shrink-0" />
              <span>Password changed successfully.</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Current Password *</label>
            <input
              type={showPw ? 'text' : 'password'}
              required
              value={currentPwInput}
              onChange={e => setCurrentPwInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">New Password *</label>
            <input
              type={showPw ? 'text' : 'password'}
              required
              minLength={6}
              value={newPwInput}
              onChange={e => setNewPwInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Confirm New Password *</label>
            <input
              type={showPw ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPwInput}
              onChange={e => setConfirmPwInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPw(p => !p)}
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPw ? 'Hide' : 'Show'} passwords
            </button>
            <button
              type="submit"
              disabled={changingPw}
              className="px-4 py-2 bg-mode-royal hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Save size={13} />
              <span>{changingPw ? 'Saving...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
