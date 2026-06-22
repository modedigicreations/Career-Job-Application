import { Menu, Bell, Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getInitials } from '@/lib/utils';
import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const currentUser = useStore((s) => s.currentUser);
  const leads = useStore((s) => s.leads);
  const contacts = useStore((s) => s.contacts);
  const projects = useStore((s) => s.projects);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
    return items;
  }, [query, leads, contacts, projects]);

  function closeSearch() {
    setShowSearch(false);
    setQuery('');
  }

  function goTo(path: string) {
    navigate(path);
    closeSearch();
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
                  placeholder="Search leads, contacts, projects..."
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

        <button className="relative p-2 rounded-md hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-bold">
            {getInitials(currentUser.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight">{currentUser.name}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
