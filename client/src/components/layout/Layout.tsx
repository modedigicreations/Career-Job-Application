import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Lead Management',
  '/pipeline': 'Sales Pipeline',
  '/contacts': 'Contacts',
  '/companies': 'Companies',
  '/projects': 'Projects',
  '/hosting': 'Hosting & Domains',
  '/invoices': 'Invoices & Payments',
  '/staff': 'Staff Performance',
  '/services': 'Service Catalog',
  '/tickets': 'Support Tickets',
  '/email-campaigns': 'Email Campaigns',
  '/settings': 'Settings',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const basePath = '/' + location.pathname.split('/').filter(Boolean)[0];
  const title = pageTitles[basePath] || 'MODE CRM';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <div className={cn('transition-all duration-300', collapsed ? 'lg:ml-[72px]' : 'lg:ml-64')}>
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
