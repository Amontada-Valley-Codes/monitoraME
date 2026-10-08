'use client';

import { Suspense } from 'react';

import { AccessGateProvider } from '@/shared/components/access-gate';
import { AppShell } from '@/shared/layout/app-shell';
import { LoadingState } from '@/shared/components/states';
import { AnalyticsProvider } from '../data/context';
import { SupplierDetailView } from './detail-page';

export function SupplierDetailShell({ type, document }: { type: 'CNPJ' | 'CPF'; document: string }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <AccessGateProvider hasAccount={false} hasPlan={false}>
        <AnalyticsProvider>
          <AppShell>
            <SupplierDetailView type={type} document={document} />
          </AppShell>
        </AnalyticsProvider>
      </AccessGateProvider>
    </Suspense>
  );
}
