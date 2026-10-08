'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AnalyticsProvider, useAnalytics } from './data/context';
import { AppShell } from '@/shared/layout/app-shell';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/shared/components/states';
import Dashboard from './pages/dashboard';
import MunicipalityDetail from './pages/municipality-detail';
import Expenses from './pages/expenses';
import ExpenseDetail from './pages/expense-detail';
import Suppliers from './pages/suppliers';
import SupplierDetail from './pages/supplier-detail';
import Territory from './pages/territory';
import Compare from './pages/compare';
import Goals from './pages/goals';
import Reports from './pages/reports';
import Methodology from './pages/methodology';
import Quality from './pages/quality';
import { PricingSection } from '@/components/pricing-section';
import { AccessGateProvider } from '@/shared/components/access-gate';
import { AuthGate } from '@/shared/auth/auth-gate';
import { CompleteAccountGate } from '@/shared/auth/complete-account-gate';
import { LeadCtaProvider } from '@/shared/auth/lead-cta-context';
import { SessionProvider } from '@/shared/auth/session-context';
import { Providers } from '@/app/providers';

function Routes() {
  const path = usePathname();
  const { state, reload, navigate } = useAnalytics();
  const parts = path.split('/').filter(Boolean);
  const section = parts[1];
  const id = parts[2];
  let page;

  if (path === '/analitico') page = <Dashboard />;
  else if (section === 'planos') page = (
    <PricingSection onAccessPlatform={() => navigate('/')} />
  );
  else if (section === 'municipios')
    page = <AuthGate><MunicipalityDetail id={id} /></AuthGate>;
  else if (section === 'empenhos' || section === 'despesas')
    page = id ? <ExpenseDetail id={id} /> : <Expenses />;
  else if (section === 'fornecedores')
    page = id ? <SupplierDetail id={id} /> : <Suppliers />;
  else if (section === 'territorio') page = <Territory />;
  else if (section === 'comparar') page = <Compare />;
  else if (section === 'metas') page = <Goals />;
  else if (section === 'relatorios') page = <Reports />;
  else if (section === 'metodologia') page = <Methodology />;
  else if (section === 'qualidade') page = <Quality />;
  else page = <EmptyState title="Página não encontrada" />;

  const needsBoundary = (!!id && section !== 'municipios') || section === 'comparar';
  const requiresCompleteAccount = path !== '/analitico' && section !== 'municipios';
  const content = needsBoundary && state === 'loading' ? (
    <LoadingState />
  ) : needsBoundary && state === 'error' ? (
    <ErrorState onRetry={reload} />
  ) : page;

  return (
    <AppShell>
      {requiresCompleteAccount ? <CompleteAccountGate>{content}</CompleteAccountGate> : content}
    </AppShell>
  );
}

export default function AnalyticsApp({
  hasAccount = false,
  hasPlan = false,
}: {
  hasAccount?: boolean;
  hasPlan?: boolean;
}) {
  return (
    <Providers><SessionProvider><LeadCtaProvider><Suspense
      fallback={
        <div className="p-8">
          <LoadingState />
        </div>
      }
    >
      <AccessGateProvider hasAccount={hasAccount} hasPlan={hasPlan}>
        <AnalyticsProvider>
          <Routes />
        </AnalyticsProvider>
      </AccessGateProvider>
    </Suspense></LeadCtaProvider></SessionProvider></Providers>
  );
}
