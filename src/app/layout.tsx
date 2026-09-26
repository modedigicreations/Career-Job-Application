import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'MODE Operations Suite (mode-ops)',
  description: 'Unified CRM, Financial Requisitions & One-Minute Team Leadership Suite for MODE Digital Creations',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-x-hidden">
      <body className="min-h-full flex flex-col antialiased bg-[#f8fafc] text-slate-900 overflow-x-hidden max-w-full">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
