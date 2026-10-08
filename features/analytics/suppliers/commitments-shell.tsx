'use client';

import { Suspense } from 'react';

import { LoadingState } from '@/shared/components/states';
import { AccessGateProvider } from '@/shared/components/access-gate';
import { AppShell } from '@/shared/layout/app-shell';
import { AnalyticsProvider } from '../data/context';
import { SupplierCommitmentsView } from './commitments-page';

export function SupplierCommitmentsShell({ type, document }: { type: 'CNPJ' | 'CPF'; document: string }) {
  return <Suspense fallback={<LoadingState />}>
    <AccessGateProvider hasAccount={false} hasPlan={false}>
      <AnalyticsProvider>
        <AppShell>
          <SupplierCommitmentsView type={type} document={document} />
        </AppShell>
      </AnalyticsProvider>
    </AccessGateProvider>
  </Suspense>;
}
