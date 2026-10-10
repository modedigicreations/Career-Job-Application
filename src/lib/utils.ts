import { Currency, RequisitionUrgency, RequisitionStatus, LeadStatus, ProjectStatus } from './types';

export function formatCurrency(amount?: number | null, currency: Currency = 'NGN'): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  // MODE Operations Suite operates officially in Nigerian Naira (₦).
  // Standardize all currency rendering to Nigerian Naira to prevent $ display discrepancies.
  return `₦${val.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
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

export function formatWhatsAppUrl(phone?: string, text?: string): string {
  if (!phone) return '#';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.substring(1);
  }
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${cleaned}${query}`;
}

export function formatMailtoUrl(email?: string, subject?: string, body?: string): string {
  if (!email) return '#';
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length > 0 ? `?${params.join('&')}` : ''}`;
}

export function isManagementUser(role?: string): boolean {
  if (!role) return false;
  return role === 'managing_director' || role === 'manager' || role === 'super_admin' || role === 'admin' || role === 'administration';
}

// The MD (managing_director) is this app's de facto top tier — the login screen has always
// labeled that account "Super Admin" — so treat it as equivalent to the otherwise-unused
// 'super_admin' role value rather than forcing every check to know about both.
export function isSuperAdminUser(role?: string): boolean {
  return role === 'super_admin' || role === 'managing_director';
}

// Management scoping: managers, administrators, and super-admins can assign tasks,
// project deliverables, and 1-Minute Goals across team members in the organization.
export function canAssignTo(currentUser: { id: string; role: string }, target: { id?: string; manager_id?: string | null }): boolean {
  if (isSuperAdminUser(currentUser.role)) return true;
  if (isManagementUser(currentUser.role)) return true;
  return target.manager_id === currentUser.id;
}

export function getMemoPriorityBadge(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'policy':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'announcement':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'normal':
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getMemoCategoryBadge(category: string) {
  switch (category) {
    case 'urgent_notice':
      return 'bg-rose-100 text-rose-800';
    case 'policy':
      return 'bg-amber-100 text-amber-800';
    case 'operations':
      return 'bg-emerald-100 text-emerald-800';
    case 'event':
      return 'bg-purple-100 text-purple-800';
    case 'general':
    default:
      return 'bg-slate-100 text-slate-800';
  }
}
