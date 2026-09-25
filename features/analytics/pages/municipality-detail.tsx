'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '../components/page-header';
import { GlobalFilters } from '../components/global-filters';
import { SummaryKpis } from '../components/summary-kpis';
import { TrendChart, DonutChart } from '../components/charts';
import { ChartPanel } from '@/shared/components/chart-panel';
import { ExpenseTable } from '../components/expense-table';
import { useAnalytics } from '../data/context';
import { MUNICIPALITIES } from '../data/fixtures';
import {
  aggregate,
  selectExpenses,
  previousYear,
  municipalityRows,
  supplierRows,
} from '../data/repository';
import { money, number } from '@/shared/lib/format';
import { EmptyState } from '@/shared/components/states';
import { ExportButton } from '@/shared/components/export-button';
import { exportDataset } from '../data/export-datasets';

export default function MunicipalityDetail({ id }: { id: string }) {
  const { filters, navigate, setFilters } = useAnalytics();
  const municipality = MUNICIPALITIES.find((m) => m.id === id);

  if (!municipality)
    return (
      <EmptyState
        title="Município não encontrado"
        description="Escolha um município no panorama."
      />
    );

  const scoped = { ...filters, municipality: id };
  const rows = selectExpenses(scoped);
  const summary = aggregate(rows);
  const previous = aggregate(selectExpenses(previousYear(scoped)));

  const series = [
    { key: 'total', label: 'Compras consideradas', color: 'var(--chart-1)' },
    { key: 'mpe', label: 'Microempresas', color: 'var(--size-me)' },
  ];

  return (
    <>
      <Button
        variant="ghost"
        className="mb-3 pl-0 text-muted-foreground"
        onClick={() => navigate('/analitico/municipios')}
      >
        <ArrowLeft className="size-4" />
        Municípios
      </Button>
      <PageHeader
        eyebrow={`${municipality.region} · Ceará`}
        title={municipality.name}
        description={`IBGE ${municipality.id} · ${number(municipality.population)} habitantes na referência ilustrativa`}
        actions={
          <ExportButton
            filters={scoped}
            dataset={exportDataset(
              {
                rows,
                summary,
                previous,
                municipalities: municipalityRows(rows),
                suppliers: supplierRows(rows),
              },
              'despesas'
            )}
          />
        }
      />
      <GlobalFilters />
      <p className="mb-4 text-xs text-muted-foreground">
        Nesta página, o município comprador está fixado em {municipality.name};
        os demais filtros são globais.
      </p>
      {!rows.length ? (
        <EmptyState
          title="Sem dados para este município e período"
          description="A ausência de registros não equivale a compras de valor zero."
          onReset={() =>
            setFilters({
              start: '2025-01-01',
              end: '2025-12-31',
              size: 'all',
              origin: 'all',
            })
          }
        />
      ) : (
        <>
          <SummaryKpis
            summary={summary}
            previous={previous}
            filters={scoped}
            extended
          />
          <Tabs defaultValue="overview">
            <TabsList className="mb-5">
              <TabsTrigger value="overview">Visão geral</TabsTrigger>
              <TabsTrigger value="expenses">Empenhos</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              <ChartPanel
                title={`Evolução das compras de ${municipality.name}`}
                description="Porte: todos no recorte · origem: seleção global"
                legend={series.map((s) => ({ label: s.label, color: s.color }))}
                rows={summary.monthly.map((m) => ({
                  label: m.label,
                  values: [money(m.total), money(m.mpe)],
                }))}
              >
                <TrendChart data={summary.monthly} series={series} />
              </ChartPanel>
              <div className="grid gap-6 xl:grid-cols-2">
                <ChartPanel
                  title="Composição por porte"
                  rows={summary.bySize.map((s) => ({
                    label: s.name,
                    values: [money(s.value)],
                  }))}
                >
                  <DonutChart data={summary.bySize} total={summary.total} />
                </ChartPanel>
                {filters.origin === 'all' && (
                  <ChartPanel
                    title="Origem dos estabelecimentos"
                    rows={summary.byOrigin.map((o) => ({
                      label: o.name,
                      values: [money(o.value)],
                    }))}
                  >
                    <DonutChart
                      data={summary.byOrigin}
                      total={summary.total}
                    />
                  </ChartPanel>
                )}
              </div>
              <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <h2 className="font-semibold">Metas de gestão municipal</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Acompanhe os objetivos definidos para participação de ME e
                    compras locais.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/analitico/metas', { municipality: id });
                  }}
                >
                  Ver metas
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="expenses">
              <ExpenseTable rows={rows} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}