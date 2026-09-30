'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Plus,
  Target,
  WalletCards,
  UserPlus,
  Check,
  ChevronDown,
  Menu,
  X,
  Clock,
  LogOut,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const {
    notifications,
    markNotificationAsRead,
    currentUser,
    toggleMobileSidebar,
    activeShift,
    logout
  } = useAppStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE TOP BAR (Phone / Tablet < 1024px)                  */}
      {/* ======================================================== */}
      <header className="lg:hidden h-14 bg-[#0B111E] text-white border-b border-slate-800/90 px-2.5 sm:px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs w-full max-w-full print:hidden">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer shrink-0"
            aria-label="Open mobile menu"
          >
            <Menu size={19} />
          </button>

          <Link href="/dashboard" className="flex items-center gap-1.5 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0D52F8] to-[#0544d0] flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/30 shrink-0">
              M
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm tracking-tight text-white">
                MODE<span className="text-[#0D52F8]">OPS</span>
              </span>
              <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v2.0
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Search, Quick Action, Notifications, Avatar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              mobileSearchOpen ? 'bg-blue-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
            aria-label="Search"
          >
            <Search size={16} />
          </button>

          {/* Quick Action Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickCreateOpen(!quickCreateOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0D52F8] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              aria-label="Quick action"
            >
              <Plus size={14} />
              <ChevronDown size={11} />
            </button>

            {quickCreateOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-1.5 z-50 animate-fade-in">
                <Link
                  href="/dashboard/crm/leads?action=create"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition"
                >
                  <UserPlus size={15} className="text-blue-600" />
                  <span>Add Sales Lead</span>
                </Link>
                <Link
                  href="/dashboard/expenses?action=create"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition"
                >
                  <WalletCards size={15} className="text-emerald-600" />
                  <span>Submit Requisition</span>
                </Link>
                <Link
                  href="/dashboard/omm/goals?action=create"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition"
                >
                  <Target size={15} className="text-purple-600" />
                  <span>Set 1-Minute Goal</span>
                </Link>
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white transition relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0B111E]" />
              )}
            </button>

            {notifOpen && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-800">Notifications ({unreadCount} new)</span>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="sm:hidden text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          n.read ? 'bg-slate-50/60 border-slate-100 text-slate-500' : 'bg-blue-50/50 border-blue-100 text-slate-800 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(n.created_at)}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 text-slate-600">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <Link
            href="/dashboard/settings"
            className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-700 hover:ring-blue-500 transition"
            title={`${currentUser.full_name} (${currentUser.role})`}
          >
            {currentUser.full_name ? currentUser.full_name[0] : 'U'}
          </Link>
        </div>
      </header>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="lg:hidden bg-[#0B111E] px-3 pb-3 pt-1 border-b border-slate-800 animate-fade-in sticky top-14 z-30 shadow-md">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, invoices, requisitions..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DESKTOP HEADER (Screens >= 1024px)                       */}
      {/* ======================================================== */}
      <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/80 px-6 lg:px-8 items-center justify-between sticky top-0 z-20 print:hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 w-72 md:w-96">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads, projects, invoices, domains..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Quick Action Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickCreateOpen(!quickCreateOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D52F8] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Quick Action</span>
              <ChevronDown size={12} />
            </button>

            {quickCreateOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50">
                <Link
                  href="/dashboard/crm/leads?action=create"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <UserPlus size={14} className="text-blue-600" />
                  <span>Add Sales Lead</span>
                </Link>
                <Link
                  href="/dashboard/expenses?action=create"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <WalletCards size={14} className="text-emerald-600" />
                  <span>Submit Requisition</span>
                </Link>
                <Link
                  href="/dashboard/omm/goals?action=create"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <Target size={14} className="text-purple-600" />
                  <span>Set 1-Minute Goal</span>
                </Link>
              </div>
            )}
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-800">Notifications ({unreadCount} new)</span>
                  <span className="text-[10px] text-slate-400">Live Updates</span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          n.read ? 'bg-slate-50/60 border-slate-100 text-slate-500' : 'bg-blue-50/50 border-blue-100 text-slate-800 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(n.created_at)}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 text-slate-600">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shift Active Indicator Badge */}
          {activeShift ? (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift Active: {new Date(activeShift.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-600">
              <Clock size={12} className="text-slate-400" />
              <span>Shift Inactive</span>
            </div>
          )}

          {/* User Profile & Logout Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 text-left hover:opacity-90 transition cursor-pointer"
              aria-label="User profile and shift options"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-800">
                {currentUser.full_name ? currentUser.full_name[0] : 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.full_name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</div>
              </div>
              <ChevronDown size={13} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in text-slate-800 text-xs">
                {/* User Info Header */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                  <div className="font-bold text-slate-900 text-xs">{currentUser.full_name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="capitalize px-1.5 py-0.2 rounded bg-blue-100 text-[10px] font-bold text-blue-700 font-mono">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{currentUser.department || 'Operations'}</span>
                  </div>
                </div>

                {/* Live Shift Info */}
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl mb-2 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-emerald-900 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-emerald-600" />
                      <span>Daily Shift Tracking</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded">
                      {activeShift ? 'Active' : 'Off Duty'}
                    </span>
                  </div>
                  {activeShift ? (
                    <p className="text-[10px] text-emerald-700 leading-tight mt-1">
                      Clocked in at {new Date(activeShift.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Clocking out will compute shift hours for payroll.
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 leading-tight mt-1">
                      Not currently on an active shift.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
                  >
                    <User size={14} className="text-slate-500" />
                    <span>My Profile &amp; Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition font-bold cursor-pointer"
                  >
                    <LogOut size={14} className="text-rose-600" />
                    <span>Clock Out &amp; Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
