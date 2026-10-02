'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Check,
  Sparkles,
  ArrowRight,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import type { Service, ServiceType, Currency } from '@/lib/types';

export default function ServicesPage() {
  const { services, addService, updateService, deleteService } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<ServiceType>('custom-software');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(650000);
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [quotedService, setQuotedService] = useState<Service | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        setToastMessage('Services catalog synchronized with live server.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {}
    setIsSyncing(false);
  };

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setType('custom-software');
    setDescription('');
    setBasePrice(650000);
    setCurrency('NGN');
    setFeatures([
      'Custom Architecture Blueprint',
      'Dedicated Project Manager',
      'QA & Performance Testing',
      '30-Day Post-Launch Support'
    ]);
    setNewFeatureInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setType(service.type);
    setDescription(service.description);
    setBasePrice(service.basePrice);
    setCurrency(service.currency || 'NGN');
    setFeatures([...service.features]);
    setNewFeatureInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureInput.trim()) return;
    setFeatures(prev => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingService) {
      updateService(editingService.id, {
        name: name.trim(),
        type,
        description: description.trim(),
        basePrice: Number(basePrice) || 0,
        currency: 'NGN',
        features,
      });
      setToastMessage(`Service offering "${name.trim()}" updated and synced successfully!`);
    } else {
      addService({
        name: name.trim(),
        type,
        description: description.trim(),
        basePrice: Number(basePrice) || 0,
        currency: 'NGN',
        isActive: true,
        features: features.length > 0 ? features : ['Standard Scope Blueprint'],
      });
      setToastMessage(`New service "${name.trim()}" added to catalog and saved!`);
    }

    setTimeout(() => setToastMessage(null), 4000);
    closeModal();
  };

  const handleDelete = () => {
    if (!editingService) return;
    if (confirm(`Are you sure you want to remove "${editingService.name}" from catalog?`)) {
      deleteService(editingService.id);
      setToastMessage(`Service "${editingService.name}" removed from catalog.`);
      setTimeout(() => setToastMessage(null), 4000);
      closeModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Confirmation Banner */}
      {toastMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Service Catalog & Rate Card
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {services.length} Core Solutions
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Server Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized offerings, base pricing tiers in Nigerian Naira (₦), and client scope blueprints.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition disabled:opacity-50"
            title="Sync latest services from server"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Server'}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
          >
            <Plus size={15} />
            <span>Add Service Offering</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map(s => (
          <div
            key={s.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition flex flex-col justify-between space-y-4 relative group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                  {s.type.replace('-', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => openEditModal(s)}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                  title="Edit Service Offering"
                >
                  <Edit3 size={14} />
                </button>
              </div>

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
                onClick={() => setQuotedService(s)}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0D52F8] text-xs font-bold transition"
              >
                Quote Scope
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingService ? 'Edit Service Offering' : 'Add Service Offering'}
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
                <label className="block text-slate-700 font-semibold mb-1">Service Solution Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Mobile Application Development"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Service Category</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as ServiceType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="website-development">Website Development</option>
                  <option value="ecommerce-development">E-commerce Development</option>
                  <option value="lms-development">LMS Development</option>
                  <option value="custom-software">Custom Software & APIs</option>
                  <option value="cbt-platform">CBT Platform</option>
                  <option value="web-hosting">Web Hosting</option>
                  <option value="seo-services">SEO Services</option>
                  <option value="graphic-design">Graphic Design</option>
                  <option value="social-media-management">Social Media Management</option>
                  <option value="domain-registration">Domain Registration</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description / Tagline *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="High-converting online storefronts with payment gateway integrations..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Base Price (Starts from in Naira ₦) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={basePrice}
                    onChange={e => setBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as Currency)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 cursor-not-allowed"
                    disabled
                  >
                    <option value="NGN">NGN (₦ - Nigerian Naira)</option>
                  </select>
                </div>
              </div>

              {/* Included Scope Builder */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Included Scope Deliverables</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add scope item (e.g. 'Paystack Integration')..."
                    value={newFeatureInput}
                    onChange={e => setNewFeatureInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newFeatureInput.trim()) {
                          setFeatures(prev => [...prev, newFeatureInput.trim()]);
                          setNewFeatureInput('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFeatureInput.trim()) {
                        setFeatures(prev => [...prev, newFeatureInput.trim()]);
                        setNewFeatureInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-1.5 rounded border border-slate-200/60">
                      <span className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" />
                        <span>{feat}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {editingService ? (
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
                    <span>{editingService ? 'Save Changes' : 'Create Offering'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quote Scope Dialog */}
      {quotedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setQuotedService(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#0D52F8]" />
                <h3 className="text-base font-bold text-slate-900">Standard Scope Quote</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuotedService(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                  {quotedService.type.replace('-', ' ')}
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-0.5">{quotedService.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{quotedService.description}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-700">Included Deliverables:</div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {quotedService.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Base Scope Estimate</span>
                  <span className="text-lg font-black text-slate-900">
                    {formatCurrency(quotedService.basePrice, quotedService.currency)}
                  </span>
                </div>
                <a
                  href="/dashboard/crm/invoices"
                  className="px-4 py-2 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                >
                  Generate Invoice
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
