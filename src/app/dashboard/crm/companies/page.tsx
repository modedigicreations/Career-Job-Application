'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Globe,
  Mail,
  Phone,
  MapPin,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function CompaniesPage() {
  const { companies, contacts, projects } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter(c => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.industry?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Corporate Accounts & Client Orgs
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {companies.length} Organizations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise clients, active contracts, and corporate relationship profiles.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company or industry..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map(comp => (
          <div
            key={comp.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                <Building2 size={20} className="text-[#0D52F8]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{comp.name}</h3>
                <span className="text-[11px] text-slate-400 font-medium">{comp.industry}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              {comp.website && (
                <div className="flex items-center gap-2">
                  <Globe size={13} className="text-slate-400" />
                  <a href={comp.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    <span>{comp.website.replace('https://', '')}</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
              {comp.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400" />
                  <span className="truncate">{comp.address}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
              <span>Client since {formatDate(comp.createdAt)}</span>
              <span className="font-bold text-blue-600">Enterprise</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
