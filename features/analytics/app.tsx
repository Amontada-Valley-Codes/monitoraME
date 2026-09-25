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
import Municipalities from './pages/municipalities';
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

function Routes() {
  const path = usePathname();
  const { state, reload } = useAnalytics();
  const parts = path.split('/').filter(Boolean);
  const section = parts[1];
  const id = parts[2];
  let page;

  if (path === '/') page = <Dashboard />;
  else if (section === 'municipios')
    page = id ? <MunicipalityDetail id={id} /> : <Municipalities />;
  else if (section === 'despesas')
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

  const needsBoundary = !!id || section === 'comparar';

  return (
    <AppShell>
      {needsBoundary && state === 'loading' ? (
        <LoadingState />
      ) : needsBoundary && state === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : (
        page
      )}
    </AppShell>
  );
}

export default function AnalyticsApp() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <LoadingState />
        </div>
      }
    >
      <AnalyticsProvider>
        <Routes />
      </AnalyticsProvider>
    </Suspense>
  );
}