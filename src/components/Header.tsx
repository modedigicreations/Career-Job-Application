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
  X
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function Header() {
  const {
    notifications,
    markNotificationAsRead,
    currentUser,
    toggleMobileSidebar
  } = useAppStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE TOP BAR (Phone / Tablet < 1024px)                  */}
      {/* ======================================================== */}
      <header className="lg:hidden h-14 bg-[#0B111E] text-white border-b border-slate-800/90 px-3 sm:px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0D52F8] to-[#0544d0] flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/30">
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
        <div className="flex items-center gap-1.5 sm:gap-2">
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
      <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/80 px-6 lg:px-8 items-center justify-between sticky top-0 z-20">
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

          {/* User Mini Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.full_name ? currentUser.full_name[0] : 'U'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.full_name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
