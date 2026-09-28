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
  ExternalLink,
  Edit3,
  X,
  Check,
  Trash2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import type { Company } from '@/lib/types';

export default function CompaniesPage() {
  const { companies, addCompany, updateCompany, deleteCompany } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const openAddModal = () => {
    setEditingCompany(null);
    setName('');
    setIndustry('');
    setWebsite('');
    setEmail('');
    setPhone('');
    setAddress('');
    setIsModalOpen(true);
  };

  const openEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setName(comp.name || '');
    setIndustry(comp.industry || '');
    setWebsite(comp.website || '');
    setEmail(comp.email || '');
    setPhone(comp.phone || '');
    setAddress(comp.address || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCompany) {
      updateCompany(editingCompany.id, {
        name,
        industry,
        website: website.startsWith('http') || !website ? website : `https://${website}`,
        email,
        phone,
        address,
      });
    } else {
      addCompany({
        name,
        industry: industry || 'Corporate Client',
        website: website.startsWith('http') || !website ? website : `https://${website}`,
        email,
        phone,
        address,
      });
    }

    closeModal();
  };

  const handleDelete = () => {
    if (!editingCompany) return;
    if (confirm(`Are you sure you want to delete ${editingCompany.name}?`)) {
      deleteCompany(editingCompany.id);
      closeModal();
    }
  };

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

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
        >
          <Plus size={15} />
          <span>Add Organization</span>
        </button>
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
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3 relative group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                  <Building2 size={20} className="text-[#0D52F8]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{comp.name}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">{comp.industry}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openEditModal(comp)}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                title="Edit organization profile"
              >
                <Edit3 size={14} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              {comp.website && (
                <div className="flex items-center gap-2">
                  <Globe size={13} className="text-slate-400 shrink-0" />
                  <a href={comp.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 truncate">
                    <span>{comp.website.replace('https://', '').replace('http://', '')}</span>
                    <ExternalLink size={10} className="shrink-0" />
                  </a>
                </div>
              )}
              {comp.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{comp.address}</span>
                </div>
              )}
              {comp.email && (
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate text-slate-500">{comp.email}</span>
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

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-sm text-slate-800">No organizations found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new organization.</p>
        </div>
      )}

      {/* Add / Edit Organization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingCompany ? 'Edit Corporate Account' : 'Add Corporate Organization'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. TechVenture Nigeria"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Industry / Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="e.g. FinTech / SaaS, Logistics, Education"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Official Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://company.ng"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="info@company.ng"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Headquarters / Location</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Lekki Phase 1, Lagos"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {editingCompany ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 text-xs"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Check size={14} />
                    <span>{editingCompany ? 'Save Changes' : 'Create Organization'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
