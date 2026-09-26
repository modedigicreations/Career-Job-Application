import { Currency, RequisitionUrgency, RequisitionStatus, LeadStatus, ProjectStatus } from './types';

export function formatCurrency(amount: number, currency: Currency = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'GBP') {
    return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `${amount}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString).getTime();
  const now = new Date().getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function getUrgencyBadge(urgency: RequisitionUrgency) {
  switch (urgency) {
    case 'Urgent':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'High':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Low':
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getRequisitionStatusBadge(status: RequisitionStatus) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Approved':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Pending':
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}

export function getLeadStatusBadge(status: LeadStatus) {
  switch (status) {
    case 'won':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'lost':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'negotiation':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'proposal-sent':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'discovery-call':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'qualified':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'contacted':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'new-lead':
    default:
      return 'bg-sky-50 text-sky-700 border-sky-200';
  }
}

export function getProjectStatusBadge(status: ProjectStatus) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'in-progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'on-hold':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'pending':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${year}-${rand}`;
}
