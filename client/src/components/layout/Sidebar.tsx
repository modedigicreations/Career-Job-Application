import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, GitBranch, UserCircle, Building2,
  FolderKanban, Server, FileText, BarChart3, Package,
  Ticket, Mail, Settings, X, ChevronLeft,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', path: '/leads', icon: Users },
  { label: 'Pipeline', path: '/pipeline', icon: GitBranch },
  { label: 'Contacts', path: '/contacts', icon: UserCircle },
  { label: 'Companies', path: '/companies', icon: Building2 },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  { label: 'Hosting', path: '/hosting', icon: Server },
  { label: 'Invoices', path: '/invoices', icon: FileText },
  { label: 'Staff', path: '/staff', icon: BarChart3 },
  { label: 'Services', path: '/services', icon: Package },
  { label: 'Tickets', path: '/tickets', icon: Ticket },
  { label: 'Campaigns', path: '/email-campaigns', icon: Mail },
  { label: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-gray-200 px-4', isCollapsed && 'justify-center')}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-sm">
                M
              </div>
              <span className="text-lg font-bold text-gray-900">MODE CRM</span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-sm">
              M
            </div>
          )}
          <button onClick={onClose} className="ml-auto p-1 lg:hidden">
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className={cn('hidden lg:flex p-1 rounded-md hover:bg-gray-100', isCollapsed ? 'mx-auto mt-2' : 'ml-auto')}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      isCollapsed && 'justify-center px-2'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {!isCollapsed && (
          <div className="border-t border-gray-200 p-4">
            <p className="text-xs text-gray-400 text-center">MODE Digital Creations</p>
          </div>
        )}
      </aside>
    </>
  );
}
