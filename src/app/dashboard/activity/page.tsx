'use client';

import React from 'react';
import {
  History,
  Activity,
  User,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function ActivityPage() {
  const { activities } = useAppStore();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
            System Operations Activity Feed
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            Real-time Audit
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Trace every lead capture, deal progression, requisition decision, and one-minute goal strategy event.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 max-w-4xl space-y-4">
        {activities.map((act, index) => (
          <div key={act.id || index} className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0D52F8] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              <Activity size={15} />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-bold text-slate-900 leading-snug break-words">{act.description}</span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{act.created_at}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>By <strong className="text-slate-700">{act.user_name}</strong></span>
                <span>•</span>
                <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600">
                  {act.entity_type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
