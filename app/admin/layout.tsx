import { Suspense, type ReactNode } from 'react';
import type { Metadata } from 'next';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminPageSkeleton } from '@/features/admin/components/admin-states';
import { AdminGate } from '@/features/admin/server/admin-gate';

export const metadata: Metadata = {
  title: 'Painel administrativo · MonitoraME',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 lg:px-8">
          <Suspense fallback={<AdminPageSkeleton />}>
            <AdminGate>{children}</AdminGate>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
