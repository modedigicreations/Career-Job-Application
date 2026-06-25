import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'NGN' | 'GBP' | 'USD' = 'NGN'): string {
  const symbols: Record<string, string> = { NGN: '₦', GBP: '£', USD: '$' };
  return `${symbols[currency]}${amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | Date): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getDaysUntil(date: string | Date): number {
  const target = new Date(date);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'new-lead': 'bg-blue-100 text-blue-800',
    qualified: 'bg-purple-100 text-purple-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    'discovery-call': 'bg-orange-100 text-orange-800',
    'proposal-sent': 'bg-indigo-100 text-indigo-800',
    negotiation: 'bg-pink-100 text-pink-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-orange-100 text-orange-800',
    cancelled: 'bg-red-100 text-red-800',
    overdue: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    'partially-paid': 'bg-yellow-100 text-yellow-800',
    sent: 'bg-cyan-100 text-cyan-800',
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
    resolved: 'bg-green-100 text-green-800',
    suspended: 'bg-orange-100 text-orange-800',
    expired: 'bg-red-100 text-red-800',
    blocked: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function exportToCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
