'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  ShieldCheck,
  Check,
  Save,
  Database
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function SettingsPage() {
  const { currentUser } = useAppStore();
  const [companyName, setCompanyName] = useState('MODE Digital Creations');
  const [defaultCurrency, setDefaultCurrency] = useState('NGN');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
            System & Enterprise Settings
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            mode-ops v2.0
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Company profile, multi-currency default configurations, and Supabase database status.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Company Profile</h2>
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="NGN">Nigerian Naira (NGN ₦)</option>
                  <option value="GBP">British Pound (GBP £)</option>
                  <option value="USD">US Dollar (USD $)</option>
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
                <Check size={14} /> Settings Saved
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
