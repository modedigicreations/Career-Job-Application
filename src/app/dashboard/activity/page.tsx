'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  Activity,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { VirtualizedList } from '@/components/VirtualizedList';

export default function ActivityPage() {
  const { activities } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchesSearch =
        !searchTerm ||
        act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.entity_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEntity = entityFilter === 'all' || act.entity_type.toLowerCase() === entityFilter.toLowerCase();

      return matchesSearch && matchesEntity;
    });
  }, [activities, searchTerm, entityFilter]);

  const entityTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach(a => {
      if (a.entity_type) types.add(a.entity_type);
    });
    return Array.from(types);
  }, [activities]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              System Operations Activity Feed
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              Live Virtualized Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trace every lead capture, deal progression, requisition decision, and one-minute goal strategy event.
          </p>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 w-44 sm:w-56"
            />
          </div>

          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Entities ({activities.length})</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 max-w-4xl">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
          <span>Audit Log Entries ({filteredActivities.length})</span>
          <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">60 FPS Windowing Active</span>
        </div>

        <VirtualizedList
          items={filteredActivities}
          itemHeight={76}
          height={560}
          overscan={5}
          keyExtractor={item => item.id}
          emptyComponent={
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching activity logs found.
            </div>
          }
          renderItem={(act) => (
            <div className="flex items-start gap-3 sm:gap-4 p-3 rounded-xl hover:bg-slate-50/80 transition-colors h-[76px] box-border border-b border-slate-100/80">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0D52F8] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <Activity size={15} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-bold text-slate-900 leading-snug truncate">{act.description}</span>
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
          )}
        />
      </div>
    </div>
  );
}
