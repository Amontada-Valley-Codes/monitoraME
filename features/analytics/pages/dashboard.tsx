'use client';

import { Info, Share2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/states';
import { PageHeader } from '../components/page-header';
import { OverviewFilters } from '../components/overview-filters';
import {
  OverviewBusinessSizes,
  OverviewDestinations,
  OverviewEvolution,
  OverviewExpenses,
  OverviewKpis,
  OverviewReading,
} from '../components/overview-sections';
import { usePipelineOverview } from '../pipeline/use-overview';
import { useOverviewSelection } from '../pipeline/use-overview-selection';

export default function Dashboard() {
  const { params, year } = useOverviewSelection();
  const { status, error, view, retry } = usePipelineOverview(params);
  const currentExercise = Number(year) === new Date().getFullYear();

  return (
    <>
      <PageHeader
        eyebrow="Inteligência territorial"
        title={view?.municipalityName
          ? `Panorama das compras públicas · ${view.municipalityName}`
          : 'Panorama das compras públicas'}
        description="Acompanhe como as compras municipais movimentam a economia do Ceará."
        actions={(
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link com o recorte copiado.');
              } catch {
                toast.error('Não foi possível copiar o link.');
              }
            }}
          >
            <Share2 className="size-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </Button>
        )}
      />

      <OverviewFilters />

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
          description="Escolha outro ano ou município e tente novamente."
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

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <OverviewExpenses params={params} />
            <OverviewBusinessSizes params={params} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <OverviewEvolution params={params} />
            <OverviewReading params={params} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <OverviewDestinations params={params} />
          </div>

          <Alert className="mt-6 bg-transparent text-muted-foreground">
            <Info className="size-4" />
            <AlertDescription>
              Fonte: {view.source}. Período consultado: {view.period}. Valores
              monetários recebidos em centavos e formatados em reais somente na tela.
            </AlertDescription>
          </Alert>
        </>
      )}
    </>
  );
}
