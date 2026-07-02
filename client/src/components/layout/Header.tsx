import { Menu, Bell, Search, X, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getInitials, formatRelativeTime, getDaysUntil } from '@/lib/utils';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const currentUser = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const leads = useStore((s) => s.leads);
  const contacts = useStore((s) => s.contacts);
  const projects = useStore((s) => s.projects);
  const invoices = useStore((s) => s.invoices);
  const tickets = useStore((s) => s.tickets);
  const hostingAccounts = useStore((s) => s.hostingAccounts);
  const activities = useStore((s) => s.activities);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const items: { label: string; sub: string; path: string }[] = [];
    leads.filter((l) => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q)).slice(0, 3)
      .forEach((l) => items.push({ label: l.name, sub: `Lead - ${l.company}`, path: '/leads' }));
    contacts.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 3)
      .forEach((c) => items.push({ label: c.name, sub: `Contact - ${c.company}`, path: '/contacts' }));
    projects.filter((p) => p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)).slice(0, 3)
      .forEach((p) => items.push({ label: p.name, sub: `Project - ${p.clientName}`, path: `/projects/${p.id}` }));
    invoices.filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q)).slice(0, 3)
      .forEach((i) => items.push({ label: i.invoiceNumber, sub: `Invoice - ${i.clientName}`, path: `/invoices/${i.id}` }));
    tickets.filter((t) => t.subject.toLowerCase().includes(q) || t.clientName.toLowerCase().includes(q)).slice(0, 2)
      .forEach((t) => items.push({ label: t.subject, sub: `Ticket - ${t.clientName}`, path: '/tickets' }));
    hostingAccounts.filter((h) => h.domainName.toLowerCase().includes(q) || h.clientName.toLowerCase().includes(q)).slice(0, 2)
      .forEach((h) => items.push({ label: h.domainName, sub: `Hosting - ${h.clientName}`, path: '/hosting' }));
    return items;
  }, [query, leads, contacts, projects, invoices, tickets, hostingAccounts]);

  const notifications = useMemo(() => {
    const items: { id: string; text: string; type: 'warning' | 'info' | 'success'; time: string; path: string }[] = [];

    hostingAccounts.filter((h) => h.status === 'active').forEach((h) => {
      const days = getDaysUntil(h.expiryDate);
      if (days <= 30 && days > 0) {
        items.push({ id: `host-${h.id}`, text: `${h.domainName} expires in ${days} days`, type: 'warning', time: h.expiryDate, path: '/hosting' });
      } else if (days <= 0) {
        items.push({ id: `host-${h.id}`, text: `${h.domainName} has expired!`, type: 'warning', time: h.expiryDate, path: '/hosting' });
      }
    });

    invoices.filter((i) => i.status === 'sent' && new Date(i.dueDate) < new Date()).forEach((i) => {
      items.push({ id: `inv-${i.id}`, text: `Invoice ${i.invoiceNumber} is overdue`, type: 'warning', time: i.dueDate, path: `/invoices/${i.id}` });
    });

    tickets.filter((t) => t.status === 'open' && t.priority === 'urgent').forEach((t) => {
      items.push({ id: `tk-${t.id}`, text: `Urgent ticket: ${t.subject}`, type: 'warning', time: t.createdAt, path: '/tickets' });
    });

    activities.slice(0, 5).forEach((a) => {
      items.push({ id: `act-${a.id}`, text: a.description, type: 'info', time: a.createdAt, path: '/activities' });
    });

    return items.slice(0, 10);
  }, [hostingAccounts, invoices, tickets, activities]);

  const urgentCount = notifications.filter((n) => n.type === 'warning').length;

  function closeSearch() {
    setShowSearch(false);
    setQuery('');
  }

  function goTo(path: string) {
    navigate(path);
    closeSearch();
    setShowNotifications(false);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100">
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        {showSearch && (
          <div className="absolute inset-x-0 top-0 z-50 flex flex-col bg-white shadow-lg sm:relative sm:inset-auto sm:shadow-none">
            <div className="flex h-16 items-center px-4 sm:h-auto sm:px-0">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search leads, contacts, projects, invoices..."
                  className="input w-full pl-9 pr-8"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                />
                <button onClick={closeSearch} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            {results.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2 sm:absolute sm:top-full sm:left-0 sm:right-0 sm:bg-white sm:rounded-b-lg sm:shadow-lg sm:border sm:border-gray-200">
                {results.map((r, i) => (
                  <button key={i} onMouseDown={() => goTo(r.path)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.label}</p>
                      <p className="text-xs text-gray-500">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {query.length >= 2 && results.length === 0 && (
              <div className="border-t border-gray-100 px-4 py-3 sm:absolute sm:top-full sm:left-0 sm:right-0 sm:bg-white sm:rounded-b-lg sm:shadow-lg sm:border sm:border-gray-200">
                <p className="text-sm text-gray-500">No results found</p>
              </div>
            )}
          </div>
        )}
        {!showSearch && (
          <button onClick={() => setShowSearch(true)} className="p-2 rounded-md hover:bg-gray-100">
            <Search className="h-5 w-5 text-gray-500" />
          </button>
        )}

        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-md hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-500" />
            {urgentCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {urgentCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {urgentCount > 0 && <span className="badge bg-red-100 text-red-700">{urgentCount} alerts</span>}
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <button key={n.id} onClick={() => goTo(n.path)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 line-clamp-2">{n.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(n.time)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-bold">
            {getInitials(currentUser.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight">{currentUser.name}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
          </div>
          <button
            onClick={() => { if (confirm('Sign out of MODE CRM?')) logout(); }}
            className="p-2 rounded-md hover:bg-gray-100 ml-1"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
