'use client';

import React, { useState } from 'react';
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
  ChevronDown,
  Menu,
  X,
  Bell,
  CheckCircle2,
  ShieldCheck,
  ArrowRightLeft
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { UserRole } from '@/lib/types';

export default function Sidebar() {
  const pathname = usePathname();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const {
    currentUser,
    setCurrentUserRole,
    leads,
    requisitions,
    goals,
    notifications,
    mobileSidebarOpen,
    setMobileSidebarOpen
  } = useAppStore();

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const pendingRequisitions = requisitions.filter(r => r.status === 'Pending').length;
  const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost').length;

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'managing_director', label: 'Managing Director (MD)', desc: 'Executive visibility, all approvals & strategy' },
    { role: 'manager', label: 'Operations Manager', desc: 'Team goals, project tracking & requisition vetting' },
    { role: 'sales', label: 'Sales & Growth Lead', desc: 'Deals, Kanban pipeline, leads & client proposals' },
    { role: 'accounts', label: 'Finance & Accounts', desc: 'Requisition disbursement, invoices & receipts' },
    { role: 'developer', label: 'Engineering Lead', desc: 'Sprint tasks, technical milestones & delivery' },
  ];

  interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
    badgeColor?: string;
  }

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'OVERVIEW',
      items: [
        { href: '/dashboard', label: 'Executive Cockpit', icon: LayoutDashboard },
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

  const handleRoleSelect = (role: UserRole) => {
    setCurrentUserRole(role);
    setRoleMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B111E] text-slate-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D52F8] to-[#0544d0] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">MODE<span className="text-[#0D52F8]">OPS</span></span>
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

      {/* Role Impersonation / Active User Switcher */}
      <div className="p-3 border-b border-slate-800/60 bg-slate-900/40 relative">
        <button
          type="button"
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#0D52F8] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.full_name ? currentUser.full_name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <span>{currentUser.role.replace('_', ' ')}</span>
                <ArrowRightLeft size={10} className="text-slate-400" />
              </div>
            </div>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Role Selection Dropdown */}
        {roleMenuOpen && (
          <div className="absolute top-full left-3 right-3 mt-1.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 p-1.5 max-h-72 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
              Switch Viewing Role
            </div>
            {roles.map(r => (
              <button
                key={r.role}
                onClick={() => handleRoleSelect(r.role)}
                className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                  currentUser.role === r.role ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-semibold">{r.label}</div>
                  <div className={`text-[10px] ${currentUser.role === r.role ? 'text-blue-100' : 'text-slate-400'}`}>{r.desc}</div>
                </div>
                {currentUser.role === r.role && <CheckCircle2 size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-[#0D52F8] text-white shadow-sm shadow-blue-500/30'
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
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 border-r border-slate-800/80 z-30">
        {navContent}
      </aside>
    </>
  );
}
