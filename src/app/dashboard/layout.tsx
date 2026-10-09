'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ShiftTaskReviewModals from '@/components/ShiftTaskReviewModals';
import { useAppStore } from '@/lib/store';
import { isSuperAdminUser } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, authLoading, currentUser, viewAsUser, setViewAsUser } = useAppStore();

  const isSuperAdmin = isSuperAdminUser(currentUser?.role);

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
        {viewAsUser && (
          isSuperAdmin ? (
            <div className="shrink-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold print:hidden shadow-md">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <Eye size={15} className="shrink-0" />
                <span>
                  <strong className="font-bold text-white">Executive Overseer Mode:</strong> Overseeing &amp; managing <span className="underline underline-offset-2">{viewAsUser.full_name}</span>&rsquo;s activities ({viewAsUser.role.replace('_', ' ')}) &mdash; Full administrative actions, edits, and assignments are active.
                </span>
              </span>
              <button
                type="button"
                onClick={() => setViewAsUser(null)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition cursor-pointer shrink-0 text-xs font-bold"
              >
                <X size={13} />
                Exit Overseer Mode
              </button>
            </div>
          ) : (
            <div className="shrink-0 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between gap-3 text-xs font-semibold print:hidden">
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                Viewing {viewAsUser.full_name}&rsquo;s dashboard as they see it &mdash; read-only, no actions can be taken.
              </span>
              <button
                type="button"
                onClick={() => setViewAsUser(null)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/10 hover:bg-amber-950/20 transition cursor-pointer shrink-0"
              >
                <X size={13} />
                Exit View
              </button>
            </div>
          )
        )}
        <Header />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden print:p-0 print:m-0 print:max-w-full print:overflow-visible">
          <fieldset disabled={!!viewAsUser && !isSuperAdmin} className="contents">
            {children}
          </fieldset>
        </main>
        <ShiftTaskReviewModals />
      </div>
    </div>
  );
}
