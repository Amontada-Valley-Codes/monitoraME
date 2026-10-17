'use client';

import { Info, TriangleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/states';
import { ExpenseElementsTable } from '../components/expense-elements-table';
import {
  OverviewBusinessSizes,
  OverviewDestinations,
  OverviewEvolution,
  OverviewExpenses,
  OverviewKpis,
} from '../components/overview-sections';
import { usePipelineOverview } from '../pipeline/use-overview';
import { useOverviewSelection } from '../pipeline/use-overview-selection';

export default function Dashboard() {
  const { params, year } = useOverviewSelection();
  const { status, error, view, retry } = usePipelineOverview(params);
  const currentExercise = Number(year) === new Date().getFullYear();

  return (
    <div className="dashboard-overview">
      <h1 className="sr-only">Panorama das compras públicas</h1>

      {status === 'loading' ? (
        <LoadingState />
      ) : status === 'error' ? (
        <div className="space-y-3">
          <ErrorState onRetry={retry} />
          {error && (
            <p className="text-center text-sm text-muted-foreground">
              {error.message}
            </p>
          )}
        </div>
      ) : !view || view.empty ? (
        <EmptyState
          title="Nenhum dado publicado para este exercício"
          description="Escolha outro exercício e tente novamente."
        />
      ) : (
        <>
          {(view.missingMonths.length > 0 || view.failures.length > 0) && (
            <div className="mb-6 space-y-3">
              {view.missingMonths.length > 0 && (
                <Alert>
                  <Info className="size-4" />
                  <AlertTitle>Dados incompletos</AlertTitle>
                  <AlertDescription>
                    {currentExercise
                      ? 'Competências ainda não publicadas: '
                      : 'Competências ausentes no exercício encerrado: '}
                    {view.missingMonths.join(', ')}.
                  </AlertDescription>
                </Alert>
              )}
              {view.failures.length > 0 && (
                <Alert variant="destructive">
                  <TriangleAlert className="size-4" />
                  <AlertTitle>Falhas no processamento</AlertTitle>
                  <AlertDescription>{view.failures.join('; ')}.</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <OverviewKpis params={params} />

          <div className="mb-3">
            <OverviewEvolution params={params} />
          </div>

          <div className="mb-3">
            <ExpenseElementsTable rows={view.expenseElements} />
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
            <OverviewBusinessSizes params={params} />
            <OverviewDestinations params={params} />
          </div>

          <div className="mb-3">
            <OverviewExpenses params={params} />
          </div>

        </>
      )}
    </div>
  );
}
