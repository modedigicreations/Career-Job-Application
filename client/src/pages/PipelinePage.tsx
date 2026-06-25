import { useStore } from '@/store/useStore';
import { formatCurrency, getInitials, cn } from '@/lib/utils';
import type { Currency } from '@/types';

function formatMultiCurrency(leads: { estimatedValue: number; currency: Currency }[]): string {
  const byCurrency: Record<string, number> = {};
  leads.forEach((l) => {
    byCurrency[l.currency] = (byCurrency[l.currency] || 0) + l.estimatedValue;
  });
  const entries = Object.entries(byCurrency).filter(([, v]) => v > 0);
  if (entries.length === 0) return formatCurrency(0);
  if (entries.length === 1) return formatCurrency(entries[0][1], entries[0][0] as Currency);
  return entries.map(([c, v]) => formatCurrency(v, c as Currency)).join(' + ');
}
import type { LeadStatus, Lead } from '@/types';
import { useState } from 'react';

const STAGES: { key: LeadStatus; label: string; color: string }[] = [
  { key: 'new-lead', label: 'New Lead', color: 'border-t-blue-500' },
  { key: 'qualified', label: 'Qualified', color: 'border-t-purple-500' },
  { key: 'contacted', label: 'Contacted', color: 'border-t-yellow-500' },
  { key: 'discovery-call', label: 'Discovery Call', color: 'border-t-orange-500' },
  { key: 'proposal-sent', label: 'Proposal Sent', color: 'border-t-indigo-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'border-t-pink-500' },
  { key: 'won', label: 'Won', color: 'border-t-green-500' },
  { key: 'lost', label: 'Lost', color: 'border-t-red-500' },
];

export default function PipelinePage() {
  const { leads, users, updateLead } = useStore();
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);

  function handleDragStart(leadId: string) {
    setDragging(leadId);
  }

  function handleDragOver(e: React.DragEvent, stage: LeadStatus) {
    e.preventDefault();
    setDragOver(stage);
  }

  function handleDrop(stage: LeadStatus) {
    if (dragging) {
      const lead = leads.find((l) => l.id === dragging);
      if (lead && lead.status !== stage) {
        const probability = stage === 'won' ? 100 : stage === 'lost' ? 0 : lead.probability;
        updateLead(dragging, { status: stage, probability });
      }
    }
    setDragging(null);
    setDragOver(null);
  }

  const activeLeads = leads.filter((l) => !['won', 'lost'].includes(l.status));
  const totalPipeline = formatMultiCurrency(activeLeads);
  const weightedPipeline = formatMultiCurrency(
    activeLeads.map((l) => ({ estimatedValue: l.estimatedValue * (l.probability / 100), currency: l.currency }))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <div>
          <span className="text-gray-500">Total Pipeline: </span>
          <span className="font-semibold text-gray-900">{totalPipeline}</span>
        </div>
        <div>
          <span className="text-gray-500">Weighted: </span>
          <span className="font-semibold text-gray-900">{weightedPipeline}</span>
        </div>
        <div>
          <span className="text-gray-500">Active Deals: </span>
          <span className="font-semibold text-gray-900">{leads.filter((l) => !['won', 'lost'].includes(l.status)).length}</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          const stageTotal = stageLeads.reduce((sum, l) => sum + l.estimatedValue, 0);

          return (
            <div
              key={stage.key}
              className={cn(
                'flex-shrink-0 w-72 rounded-lg bg-gray-50 border-t-4',
                stage.color,
                dragOver === stage.key && 'ring-2 ring-brand-500 ring-offset-2'
              )}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">{stage.label}</h3>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                    {stageLeads.length}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(stageTotal)}</p>
              </div>

              <div className="p-2 space-y-2 min-h-[200px]">
                {stageLeads.map((lead) => (
                  <DealCard key={lead.id} lead={lead} users={users} onDragStart={handleDragStart} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealCard({ lead, users, onDragStart }: { lead: Lead; users: any[]; onDragStart: (id: string) => void }) {
  const assignee = users.find((u: any) => u.id === lead.assignedTo);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      className="rounded-lg bg-white border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
      <p className="text-xs text-gray-500 mt-0.5">{lead.company}</p>

      <div className="flex items-center justify-between mt-3">
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(lead.estimatedValue, lead.currency)}</span>
        <span className="text-xs text-gray-400">{lead.probability}%</span>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        {assignee && (
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-600">
              {getInitials(assignee.name)}
            </div>
            <span className="text-[11px] text-gray-500">{assignee.name.split(' ')[0]}</span>
          </div>
        )}
        {lead.expectedCloseDate && (
          <span className="text-[11px] text-gray-400">
            {new Date(lead.expectedCloseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  );
}
