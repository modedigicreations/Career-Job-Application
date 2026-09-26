'use client';

import React from 'react';
import {
  ShieldCheck,
  Users,
  UserCheck,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function StaffAllocationPage() {
  const { users } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
            Staff Allocation & Management Hierarchy
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Executive View
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review reporting chains, departmental assignments, and role-based permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map(u => (
          <div
            key={u.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#0D52F8] text-white flex items-center justify-center font-bold text-base shadow-sm">
                {u.full_name[0]}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{u.full_name}</h3>
                <span className="text-[11px] text-slate-500">{u.job_title}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">Department:</span> <strong className="text-slate-800">{u.department}</strong>
              </div>
              <div>
                <span className="text-slate-400">System Role:</span> <strong className="text-blue-600 uppercase font-mono text-[10px]">{u.role.replace('_', ' ')}</strong>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                {u.email}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck size={13} /> Active Staff
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
