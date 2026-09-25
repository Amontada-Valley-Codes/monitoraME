'use client';

import { useAnalytics } from '../data/context';
import { PageHeader } from '../components/page-header';
import { GlobalFilters } from '../components/global-filters';
import { ExpenseTable } from '../components/expense-table';
import { LoadingState, ErrorState } from '@/shared/components/states';
import { exportDataset } from '../data/export-datasets';
import { ExportButton } from '@/shared/components/export-button';

export default function Expenses() {
  const { data, state, reload, filters } = useAnalytics();

  return (
    <>
      <PageHeader
        eyebrow="Exploração dos dados"
        title="Despesas empenhadas"
        description="Consulte os registros que compõem os indicadores, com valores e procedência."
        actions={
          data && (
            <ExportButton
              dataset={exportDataset(data, 'despesas')}
              filters={filters}
            />
          )
        }
      />
      <GlobalFilters />
      {state === 'loading' ? (
        <LoadingState />
      ) : state === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : (
        data && <ExpenseTable rows={data.rows} />
      )}
    </>
  );
}