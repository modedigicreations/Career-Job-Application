'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ShiftTaskReviewModals from '@/components/ShiftTaskReviewModals';
import { useAppStore } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, authLoading } = useAppStore();

  // middleware.ts already redirects server-side for a missing/invalid session cookie —
  // this is the client-side complement for the case where the cookie is valid at request
  // time but the store's own /api/auth/me check (which is what actually hydrates
  // currentUser/isAuthenticated) comes back negative, e.g. the account was deactivated
  // mid-session.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] overflow-x-hidden w-full print:bg-white print:block print:min-h-0 print:overflow-visible">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden print:block print:overflow-visible">
        <Header />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden print:p-0 print:m-0 print:max-w-full print:overflow-visible">
          {children}
        </main>
        <ShiftTaskReviewModals />
      </div>
    </div>
  );
}
