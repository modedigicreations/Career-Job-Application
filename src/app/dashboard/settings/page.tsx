'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  ShieldCheck,
  Check,
  Save,
  Database,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function SettingsPage() {
  const { currentUser, updateUserProfile, users } = useAppStore();
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
                <span className="font-semibold text-slate-700">Supabase PostgreSQL Engine</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ready / Migrations Packaged
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Unified schema stored at <code className="font-mono text-blue-600">supabase/schema.sql</code> merging CRM, Requisitions, and One-Minute Manager.
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
              className="px-5 py-2.5 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Save size={14} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
