import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] overflow-x-hidden w-full print:bg-white print:block print:min-h-0 print:overflow-visible">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden print:block print:overflow-visible">
        <Header />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden print:p-0 print:m-0 print:max-w-full print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
