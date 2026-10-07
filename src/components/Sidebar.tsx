'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  UserCheck,
  Users,
  Building2,
  Globe,
  Receipt,
  FolderKanban,
  LifeBuoy,
  Briefcase,
  WalletCards,
  Banknote,
  Target,
  Sparkles,
  History,
  Settings,
  Menu,
  X,
  Bell,
  ShieldCheck,
  Clock,
  LogOut,
  Megaphone,
  PiggyBank
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { isManagementUser, isSuperAdminUser } from '@/lib/utils';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentUser,
    leads,
    requisitions,
    goals,
    notifications,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    activeShift,
    clockInStaff,
    setResumeShiftModalOpen,
    setShiftReviewModalOpen,
    logout,
    memos
  } = useAppStore();

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const pendingRequisitions = requisitions.filter(r => r.status === 'Pending').length;
  const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost').length;

  const isManager = isManagementUser(currentUser.role);
  const unreadMemos = memos.filter(m => {
    const isTarget = m.targetAudience === 'all' ||
      (m.targetAudience === 'department' && m.targetDepartment?.toLowerCase() === currentUser.department?.toLowerCase()) ||
      (m.targetAudience === 'specific_staff' && m.targetStaffIds?.includes(currentUser.id)) ||
      m.senderId === currentUser.id ||
      isManager;
    return isTarget && !m.readBy?.[currentUser.id];
  }).length;

  interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
    badgeColor?: string;
    superAdminOnly?: boolean;
  }

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'OVERVIEW',
      items: [
        { href: '/dashboard', label: 'Executive Cockpit', icon: LayoutDashboard },
        { 
          href: '/dashboard/memos', 
          label: 'Staff Memos', 
          icon: Megaphone, 
          badge: unreadMemos > 0 ? `${unreadMemos}` : undefined,
          badgeColor: 'bg-rose-500 text-white'
        },
      ],
    },
    {
      title: 'SALES & CRM',
      items: [
        { href: '/dashboard/crm/pipeline', label: 'Pipeline Kanban', icon: Kanban, badge: activeLeads ? `${activeLeads}` : undefined },
        { href: '/dashboard/crm/leads', label: 'Leads & Enquiries', icon: UserCheck },
        { href: '/dashboard/crm/contacts', label: 'Client Directory', icon: Users },
        { href: '/dashboard/crm/companies', label: 'Corporate Accounts', icon: Building2 },
        { href: '/dashboard/crm/hosting', label: 'Hosting & Domains', icon: Globe },
        { href: '/dashboard/crm/invoices', label: 'Invoices & Billing', icon: Receipt },
      ],
    },
    {
      title: 'DELIVERY & OPS',
      items: [
        { href: '/dashboard/crm/projects', label: 'Projects & Tasks', icon: FolderKanban },
        { href: '/dashboard/crm/tickets', label: 'Support Tickets', icon: LifeBuoy },
        { href: '/dashboard/crm/services', label: 'Service Catalog', icon: Briefcase },
      ],
    },
    {
      title: 'OFFICE & FINANCE',
      items: [
        { 
          href: '/dashboard/expenses', 
          label: 'Expense Requisitions', 
          icon: WalletCards, 
          badge: pendingRequisitions > 0 ? `${pendingRequisitions}` : undefined,
          badgeColor: 'bg-amber-500 text-white'
        },
        {
          href: '/dashboard/payroll',
          label: 'Staff Payroll',
          icon: Banknote,
        },
        {
          href: '/dashboard/pnl',
          label: 'Profit & Loss',
          icon: PiggyBank,
          superAdminOnly: true,
        },
      ],
    },
    {
      title: 'ONE-MINUTE LEADERSHIP',
      items: [
        { href: '/dashboard/omm/goals', label: '1-Minute Goals', icon: Target },
        { href: '/dashboard/omm/feedback', label: 'Praise & Redirects', icon: Sparkles },
        { href: '/dashboard/omm/assign', label: 'Staff Allocation', icon: ShieldCheck },
      ],
    },
    {
      title: 'AUDIT & SYSTEM',
      items: [
        { href: '/dashboard/activity', label: 'Activity Feed', icon: History },
        { href: '/dashboard/settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B111E] text-slate-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mode-royal to-mode-cobalt flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">MODE<span className="text-mode-royal">OPS</span></span>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Management</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white cursor-pointer"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Current signed-in user (no account switching — see Settings for your own profile/password) */}
      <div className="p-3 border-b border-slate-800/60 bg-slate-900/40">
        <div className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-mode-royal text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.full_name ? currentUser.full_name[0] : 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser.full_name}
            </div>
            <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
              {currentUser.role.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.filter(item => !item.superAdminOnly || isSuperAdminUser(currentUser.role)).map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-mode-royal text-white shadow-sm shadow-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Clock Out & Log Out Action Bar */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/60 space-y-1.5">
        {activeShift ? (
          <div className="px-2.5 py-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Shift Active</span>
            </span>
            <span>{new Date(activeShift.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setResumeShiftModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 rounded-xl transition cursor-pointer shadow-xs"
          >
            <Clock size={13} className="text-emerald-400" />
            <span>Clock In &amp; Set Work Plan</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setMobileSidebarOpen(false);
            if (activeShift) {
              setShiftReviewModalOpen(true);
            } else {
              logout();
              router.push('/login');
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition cursor-pointer"
        >
          <LogOut size={13} />
          <span>Clock Out &amp; Review Tasks</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Postgres Connected</span>
        </div>
        <span className="font-mono text-[10px] text-slate-300">MODE Digital</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 border-r border-slate-800/80 z-30 print:hidden">
        {navContent}
      </aside>
    </>
  );
}
