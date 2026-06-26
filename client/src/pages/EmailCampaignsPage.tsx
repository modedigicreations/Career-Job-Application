import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatDate, cn } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Mail, Send, Eye, Pause, Play, MousePointerClick } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { showToast } from '@/components/ui/Toast';
import type { EmailCampaign } from '@/types';

export default function EmailCampaignsPage() {
  const { emailCampaigns, addEmailCampaign, updateEmailCampaign } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'custom' as EmailCampaign['type'] });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addEmailCampaign({
      id: uuid(), ...form, status: 'draft',
      recipientCount: 0, sentCount: 0, openRate: 0, clickRate: 0,
      createdAt: new Date().toISOString(),
    });
    showToast('Campaign created successfully');
    setShowForm(false);
    setForm({ name: '', type: 'custom' });
  }

  function toggleStatus(campaign: EmailCampaign) {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateEmailCampaign(campaign.id, { status: newStatus });
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Email Sequences</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Lead Nurture Sequence</h4>
            <div className="space-y-2">
              {[
                { day: 'Day 1', action: 'Welcome Email', desc: 'Introduction to MODE Digital Creations' },
                { day: 'Day 3', action: 'Case Study', desc: 'Share relevant success story' },
                { day: 'Day 7', action: 'Service Offer', desc: 'Highlight relevant service' },
                { day: 'Day 14', action: 'Follow-up', desc: 'Check in and offer consultation' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-600 flex-shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{step.day}: {step.action}</p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Hosting Renewal Sequence</h4>
            <div className="space-y-2">
              {[
                { day: '90 days', action: '90-Day Reminder', desc: 'Early renewal notice with discount offer' },
                { day: '30 days', action: '30-Day Reminder', desc: 'Renewal approaching notification' },
                { day: '7 days', action: '7-Day Reminder', desc: 'Urgent renewal reminder' },
                { day: 'Expired', action: 'Expired Notice', desc: 'Service suspension warning' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0',
                    i === 3 ? 'bg-red-100 text-red-600' : i === 2 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                  )}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{step.day}: {step.action}</p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="h-4 w-4 mr-2" /> New Campaign</button>
      </div>

      {emailCampaigns.length === 0 ? (
        <EmptyState icon={Mail} title="No campaigns" description="Create your first email campaign." action={<button onClick={() => setShowForm(true)} className="btn-primary">New Campaign</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {emailCampaigns.map((campaign) => (
            <div key={campaign.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{campaign.name}</h4>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{campaign.type.replace(/-/g, ' ')}</p>
                </div>
                <StatusBadge status={campaign.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Send className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">{campaign.sentCount}/{campaign.recipientCount}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Sent</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">{campaign.openRate}%</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Open Rate</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 text-center col-span-2">
                  <div className="flex items-center justify-center gap-1">
                    <MousePointerClick className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">{campaign.clickRate}%</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Click Rate</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">Created {formatDate(campaign.createdAt)}</span>
                {campaign.status !== 'completed' && campaign.status !== 'draft' && (
                  <button onClick={() => toggleStatus(campaign)} className="text-xs text-brand-500 font-medium hover:text-brand-700 flex items-center gap-1">
                    {campaign.status === 'active' ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Activate</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Campaign">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Campaign Name *</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EmailCampaign['type'] })}>
              <option value="lead-nurture">Lead Nurture</option>
              <option value="hosting-renewal">Hosting Renewal</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Campaign</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
