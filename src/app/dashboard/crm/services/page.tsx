'use client';

import React from 'react';
import {
  Briefcase,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
  const { services } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
            Service Catalog & Rate Card
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {services.length} Core Solutions
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Standardized offerings, base pricing tiers, and client scope blueprints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map(s => (
          <div
            key={s.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                {s.type.replace('-', ' ')}
              </span>
              <h3 className="font-extrabold text-base text-slate-900">{s.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-700">Included Scope:</div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {s.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Starts from</span>
                <span className="text-base font-black text-slate-900">
                  {formatCurrency(s.basePrice, s.currency)}
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0D52F8] text-xs font-bold transition"
              >
                Quote Scope
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
