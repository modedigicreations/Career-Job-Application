import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { Plus, Edit2, Package, Check } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import type { Service, ServiceType, Currency } from '@/types';

const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'website-development', label: 'Website Development' },
  { value: 'ecommerce-development', label: 'E-commerce Development' },
  { value: 'lms-development', label: 'LMS Development' },
  { value: 'custom-software', label: 'Custom Software' },
  { value: 'seo-services', label: 'SEO Services' },
  { value: 'web-hosting', label: 'Web Hosting' },
  { value: 'domain-registration', label: 'Domain Registration' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'social-media-management', label: 'Social Media Management' },
  { value: 'cbt-platform', label: 'CBT Platform' },
];

const emptyService: Omit<Service, 'id'> = {
  name: '', type: 'website-development', description: '', basePrice: 0,
  currency: 'NGN', isActive: true, features: [],
};

export default function ServicesPage() {
  const { services, addService, updateService } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyService);
  const [featureInput, setFeatureInput] = useState('');

  function openCreate() { setEditing(null); setForm(emptyService); setShowForm(true); }
  function openEdit(service: Service) { setEditing(service); setForm(service); setShowForm(true); }

  function addFeature() {
    if (featureInput.trim()) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] });
      setFeatureInput('');
    }
  }

  function removeFeature(index: number) {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateService(editing.id, form);
    } else {
      addService({ ...form, id: uuid() } as Service);
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> Add Service</button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="card overflow-hidden">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{service.name}</h3>
                  <p className="text-brand-100 text-sm mt-1">Starting from</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(service.basePrice, service.currency)}</p>
                </div>
                <button onClick={() => openEdit(service)} className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <StatusBadge status={service.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Service' : 'Add Service'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="label">Service Name *</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ServiceType })}>
                {SERVICE_TYPE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
                <option value="NGN">NGN</option><option value="GBP">GBP</option><option value="USD">USD</option>
              </select>
            </div>
            <div><label className="label">Base Price</label><input type="number" className="input" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} /></div>
          </div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <label className="label">Features</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add a feature..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
              <button type="button" onClick={addFeature} className="btn-secondary">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  {f}
                  <button type="button" onClick={() => removeFeature(i)} className="text-gray-400 hover:text-gray-600">&times;</button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" id="active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /><label htmlFor="active" className="text-sm text-gray-700">Active</label></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
