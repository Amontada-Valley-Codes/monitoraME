'use client';

import { Info, RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/states';
import {
  OverviewBusinessSizes,
  OverviewDestinations,
  OverviewEvolution,
  OverviewExpenses,
  OverviewKpis,
  OverviewMunicipalityRanking,
} from '../components/overview-sections';
import { usePipelineOverview } from '../pipeline/use-overview';
import { useOverviewSelection } from '../pipeline/use-overview-selection';

export default function Dashboard() {
  const { params, year } = useOverviewSelection();
  const { status, error, view, retry } = usePipelineOverview(params);
  const currentExercise = Number(year) === new Date().getFullYear();

  return (
    <div className="dashboard-overview analytics-overview">
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

          <div className="analytics-overview-heading">
            <div><h2>Indicadores em destaque</h2><p>Uma leitura rápida do recorte selecionado.</p></div>
            <Button variant="outline" onClick={retry} className="min-h-11 gap-2" aria-label="Atualizar dados da visão geral"><RefreshCw className="size-4" />Atualizar dados</Button>
          </div>
          <OverviewKpis params={params} />
          <OverviewMunicipalityRanking items={view.municipalityRanking} />
          <OverviewExpenses params={params} />
          <div className="analytics-overview-grid analytics-overview-grid-pies">
            <OverviewBusinessSizes params={params} />
            <OverviewDestinations params={params} />
          </div>
          <OverviewEvolution params={params} />

        </>
      )}
    </div>
  );
}
