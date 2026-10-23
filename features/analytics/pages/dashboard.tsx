'use client';

import { CalendarDays, Clock3, Database, Info, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/states';
import { dateLabel } from '@/shared/lib/format';
import {
  OverviewDistribution,
  OverviewEvolution,
  OverviewExpenses,
  OverviewKpis,
  OverviewMunicipalityRanking,
} from '../components/overview-sections';
import { usePipelineOverview } from '../pipeline/use-overview';
import { useOverviewSelection } from '../pipeline/use-overview-selection';
import { OverviewFilters } from '../components/overview-filters';

function updatedAtLabel(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function Dashboard() {
  const { params, year } = useOverviewSelection();
  const { status, error, view, retry } = usePipelineOverview(params);
  const currentExercise = Number(year) === new Date().getFullYear();
  const lastUpdate = updatedAtLabel(view?.cacheUpdatedAt ?? null);
  const [startDate, endDate] = view?.period.split(' a ') ?? [];

  return (
    <div className="dashboard-overview analytics-overview">
      <div className="analytics-overview-heading">
        <div className="min-w-0">
          <h1>Compras públicas no Ceará</h1>
          <p>Indicadores de ME no exercício selecionado.</p>
        </div>
      </div>
      <div className="analytics-overview-provenance" aria-label="Período e origem dos dados">
        {view && !view.empty && (
          <>
            <span>
              <CalendarDays aria-hidden="true" />
              {startDate && endDate
                ? `${dateLabel(startDate)} – ${dateLabel(endDate)}`
                : `Exercício ${year}`}
            </span>
            <span><Database aria-hidden="true" />Fonte: {view.source}</span>
            {lastUpdate && <span><Clock3 aria-hidden="true" />Atualizado em {lastUpdate}</span>}
          </>
        )}
        <OverviewFilters />
      </div>

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
            <div className="analytics-overview-alerts">
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

          <div className="analytics-overview-grid analytics-overview-grid-featured analytics-overview-primary-grid">
            <OverviewEvolution params={params} />
            <OverviewDistribution params={params} />
          </div>

          <div className="analytics-overview-grid analytics-overview-grid-featured analytics-overview-secondary-grid">
            <OverviewExpenses params={params} />
            <OverviewMunicipalityRanking items={view.municipalityRanking} />
          </div>
        </>
      )}
    </div>
  );
}
