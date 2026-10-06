import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import LeadsPage from '@/pages/LeadsPage';
import PipelinePage from '@/pages/PipelinePage';
import ContactsPage from '@/pages/ContactsPage';
import CompaniesPage from '@/pages/CompaniesPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import OneMinuteManagerPage from '@/pages/OneMinuteManagerPage';
import RequisitionsPage from '@/pages/RequisitionsPage';
import FinancialsPage from '@/pages/FinancialsPage';
import HostingPage from '@/pages/HostingPage';
import InvoicesPage from '@/pages/InvoicesPage';
import InvoiceDetailPage from '@/pages/InvoiceDetailPage';
import StaffPage from '@/pages/StaffPage';
import ServicesPage from '@/pages/ServicesPage';
import TicketsPage from '@/pages/TicketsPage';
import EmailCampaignsPage from '@/pages/EmailCampaignsPage';
import ActivityLogPage from '@/pages/ActivityLogPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const authLoading = useStore((s) => s.authLoading);
  const initAuth = useStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/one-minute-manager" element={<OneMinuteManagerPage />} />
        <Route path="/requisitions" element={<RequisitionsPage />} />
        <Route path="/financials" element={<FinancialsPage />} />
        <Route path="/hosting" element={<HostingPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/email-campaigns" element={<EmailCampaignsPage />} />
        <Route path="/activities" element={<ActivityLogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
