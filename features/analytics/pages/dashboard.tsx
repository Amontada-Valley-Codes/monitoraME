'use client';

import { ArrowRight, Info, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { PageHeader } from '../components/page-header';
import { SummaryKpis } from '../components/summary-kpis';
import { ChartPanel } from '@/shared/components/chart-panel';
import { TrendChart, DonutChart, BarsChart } from '../components/charts';
import { MunicipalTable } from '../components/municipal-table';
import { GlobalFilters } from '../components/global-filters';

import { useAnalytics } from '../data/context';
import { money, percent, ratio } from '@/shared/lib/format';
import { ExportButton } from '@/shared/components/export-button';
import { exportDataset } from '../data/export-datasets';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/shared/components/states';

export default function Dashboard() {
  const { data, state, filters, setFilters, reset, reload, navigate } =
    useAnalytics();
  const a = data?.summary;
  const series = [
    {
      key: 'total',
      label: 'Compras consideradas',
      color: 'var(--chart-1)',
    },
    { key: 'mpe', label: 'Microempresas', color: 'var(--size-me)' },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Inteligência territorial"
        title="Panorama das compras públicas"
        description="Acompanhe como as compras municipais movimentam a economia do Ceará."
        actions={
          <>
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
            {data && (
              <ExportButton
                dataset={exportDataset(data)}
                filters={filters}
              />
            )}
          </>
        }
      />
      <GlobalFilters />
      {state === 'loading' ? (
        <LoadingState />
      ) : state === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : !a || !a.count ? (
        <EmptyState onReset={reset} />
      ) : (
        <>
          <SummaryKpis
            summary={a}
            previous={data!.previous}
            filters={filters}
          />
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <ChartPanel
              className="xl:col-span-2"
              title="Evolução das compras consideradas"
              description="Empenho líquido por mês · porte: todos no recorte · origem: seleção global"
              legend={series.map((s) => ({
                label: s.label,
                color: s.color,
              }))}
              rows={a.monthly.map((m) => ({
                label: m.label,
                values: [money(m.total), money(m.mpe)],
              }))}
            >
              <TrendChart data={a.monthly} series={series} />
              <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                <span>Valores mensais, sem acumulação</span>
                <Button
                  variant="link"
                  className="h-auto min-h-0 p-0 text-xs"
                  onClick={() => navigate('/analitico/comparar')}
                >
                  Comparar períodos
                  <ArrowRight className="size-3" />
                </Button>
              </div>
            </ChartPanel>
            <section className="panel flex flex-col p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold">Leitura do período</h2>
                <Info className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Participação das microempresas
              </p>
              <p className="metric mt-4 text-4xl text-primary">
                {percent(ratio(a.mpe, a.total))}
              </p>
              <p className="mt-3 text-sm leading-relaxed">
                De cada R$ 100 em compras consideradas,{' '}
                <strong className="text-primary">
                  {money(Math.round(ratio(a.mpe, a.total) * 100))}
                </strong>{' '}
                foram empenhados para microempresas.
              </p>
              <div className="mt-6 space-y-3 border-t pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    MEI, em separado
                  </span>
                  <span className="font-medium">
                    {percent(ratio(a.mei, a.total))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Porte não identificado
                  </span>
                  <span className="font-medium">
                    {percent(ratio(a.bySize.at(-1)!.value, a.total))}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-auto w-full text-primary"
                onClick={() => navigate('/analitico/metodologia')}
              >
                Entender os indicadores
                <ArrowRight className="size-4" />
              </Button>
            </section>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartPanel
              title="Participação por porte empresarial"
              description="Percentual do valor considerado · origem: seleção global"
              rows={a.bySize.map((s) => ({
                label: s.name,
                values: [money(s.value)],
              }))}
            >
              <DonutChart
                data={a.bySize}
                total={a.total}
                fillVerticalSpace
                onSelect={(size) => setFilters({ size })}
              />
            </ChartPanel>
            <ChartPanel
              title="Naturezas de despesas"
              description="Sete naturezas consideradas · porte e origem: seleção global"
              legend={[
                {
                  label: 'Valor empenhado líquido',
                  color: 'var(--chart-1)',
                },
              ]}
              rows={a.byCategory.map((c) => ({
                label: c.name,
                values: [money(c.value)],
              }))}
            >
              <BarsChart
                data={a.byCategory.map((c) => ({
                  name: c.key.slice(-2),
                  value: c.value,
                }))}
                series={[
                  {
                    key: 'value',
                    label: 'Valor considerado',
                    color: 'var(--chart-1)',
                  },
                ]}
              />
              <Button
                variant="link"
                className="h-auto min-h-0 p-0 text-xs"
                onClick={() => navigate('/analitico/despesas')}
              >
                Explorar naturezas e empenhos
                <ArrowRight className="size-3" />
              </Button>
            </ChartPanel>
          </div>
          {filters.origin === 'all' && (
            <div className="mb-6">
              <ChartPanel
                title="Destino dos recursos"
                description="Origem do estabelecimento em relação ao município comprador · porte: seleção global"
                rows={a.byOrigin.map((o) => ({
                  label: o.name,
                  values: [money(o.value)],
                }))}
              >
                <div className="grid items-center gap-6 xl:grid-cols-2">
                  <DonutChart
                    data={a.byOrigin}
                    total={a.total}
                    onSelect={(origin) => setFilters({ origin })}
                  />
                  <div className="rounded-lg bg-muted/60 p-5">
                    <h3 className="text-sm font-semibold">
                      O que significa evasão municipal?
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Soma dos valores destinados a estabelecimentos em outros
                      municípios do Ceará e fora do estado. A origem não
                      identificada permanece separada e no denominador.
                    </p>
                    <Button
                      variant="link"
                      className="px-0"
                      onClick={() => navigate('/analitico/territorio')}
                    >
                      Explorar o território
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </ChartPanel>
            </div>
          )}
          <MunicipalTable
            rows={data!.municipalities.filter(
              (m) =>
                filters.municipality === 'all' ||
                m.id === filters.municipality
            )}
            compact
          />
          <Alert className="mt-6 bg-transparent text-muted-foreground">
            <Info className="size-4" />
            <AlertDescription>
              Despesas empenhadas não representam valores pagos. A amostra cobre
              19 municípios com dados fictícios; Carnaubal demonstra o estado sem
              dados.
            </AlertDescription>
          </Alert>
        </>
      )}
    </>
  );
}
