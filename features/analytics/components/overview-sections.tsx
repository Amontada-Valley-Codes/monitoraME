'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight, ChartPie, MapPin, Store, Wallet } from 'lucide-react';

import { BarsChart, DonutChart, TrendChart } from './charts';
import { ChartPanel } from '@/shared/components/chart-panel';
import { KpiCard } from '@/shared/components/kpi-card';
import { compactMoney, money, percent } from '@/shared/lib/format';
import type { PipelineOverviewParams } from '../pipeline/types';
import {
  useOverviewBusinessSizes,
  useOverviewDestinations,
  useOverviewExpenseElements,
  useOverviewKpis,
  useOverviewMonthlyEvolution,
} from '../pipeline/use-overview';

function valueOrDash(value: number | null, formatter: (value: number) => string): string {
  return value === null ? '—' : formatter(value);
}

export function OverviewKpis({
  params,
  expenseChart,
}: {
  params: PipelineOverviewParams;
  expenseChart: ReactNode;
}) {
  const { data, view } = useOverviewKpis(params);
  if (!data || !view) return null;

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2 xl:grid-rows-2 xl:gap-x-6 xl:gap-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          label="Participação de ME e MEI"
          value={valueOrDash(data.meMeiPercentage, percent)}
          detail="Percentual de compras de Microempresas e Empresas de Pequeno Porte"
          change={null}
          icon={ChartPie}
          sizeScope="ME + MEI"
          highlight
        />
        <KpiCard
          label="Total de compras de ME"
          value={valueOrDash(data.mePurchasesCents, compactMoney)}
          detail="Valor líquido em reais"
          change={null}
          icon={Wallet}
          sizeScope="ME"
        />
      </div>

      <div className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-1 *:h-full">
        {expenseChart}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-start-1 xl:row-start-2">
        <KpiCard
          label="Compras com fornecedores locais"
          value={valueOrDash(data.localPercentage, percent)}
          detail="No município comprador"
          change={null}
          icon={MapPin}
        />
        <KpiCard
          label="Recursos fora do município"
          value={valueOrDash(data.outsidePercentage, percent)}
          detail="Percentual informado pelo pipeline"
          change={null}
          icon={ArrowUpRight}
          inverse
        />
      </div>
    </div>
  );
}

export function OverviewExpenses({ params }: { params: PipelineOverviewParams }) {
  const { data, status, retry } = useOverviewExpenseElements(params);
  const rows = data ?? [];
  return (
    <ChartPanel
      title="Elementos de despesas"
      description="Valores líquidos consolidados pelo pipeline"
      legend={[{ label: 'Valor empenhado líquido', color: 'var(--chart-1)' }]}
      rows={rows.map((item) => ({ label: item.name, values: [money(item.value)] }))}
      state={status}
      onRetry={retry}
      empty={status === 'ready' && rows.length === 0}
    >
      <div className="h-(--chart-height) min-h-(--chart-height) w-full">
        <BarsChart
          data={rows.map((item) => ({
            name: item.key.slice(-2),
            label: item.name,
            value: item.value,
          }))}
          series={[{ key: 'value', label: 'Valor líquido', color: 'var(--chart-1)' }]}
          fullWidth
        />
      </div>
    </ChartPanel>
  );
}

export function OverviewEvolution({ params }: { params: PipelineOverviewParams }) {
  const { data, status, retry } = useOverviewMonthlyEvolution(params);
  const rows = data ?? [];
  const series = [
    { key: 'total', label: 'Compras consideradas', color: 'var(--chart-1)' },
    { key: 'mpe', label: 'Microempresas', color: 'var(--size-me)' },
  ];
  return (
    <ChartPanel
      className="xl:col-span-2"
      title="Evolução das compras consideradas"
      description="Valores mensais, sem acumulação"
      legend={series.map((item) => ({ label: item.label, color: item.color }))}
      rows={rows.map((item) => ({
        label: item.label,
        values: [money(item.total), money(item.mpe)],
      }))}
      state={status}
      onRetry={retry}
      empty={status === 'ready' && rows.length === 0}
    >
      <TrendChart data={rows} series={series} />
    </ChartPanel>
  );
}

export function OverviewBusinessSizes({ params }: { params: PipelineOverviewParams }) {
  const { data, status, retry, view } = useOverviewBusinessSizes(params);
  const rows = data ?? [];
  return (
    <ChartPanel
      title="Participação por porte empresarial"
      description="Percentual do valor valor liquido anual"
      rows={rows.map((item) => ({ label: item.name, values: [money(item.value)] }))}
      state={status}
      onRetry={retry}
      empty={status === 'ready' && rows.length === 0}
    >
      <DonutChart data={rows} total={view?.totalCents ?? 0} />
    </ChartPanel>
  );
}

export function OverviewDestinations({ params }: { params: PipelineOverviewParams }) {
  const { data, status, retry } = useOverviewDestinations(params);
  const rows = data ?? [];
  const meTotalCents = rows.reduce((total, item) => total + item.value, 0);
  return (
    <ChartPanel
      title="Destino dos recursos"
      description="Origem das compras de ME em relação ao município comprador"
      rows={rows.map((item) => ({ label: item.name, values: [money(item.value)] }))}
      state={status}
      onRetry={retry}
      empty={status === 'ready' && rows.length === 0}
    >
      <DonutChart data={rows} total={meTotalCents} />
    </ChartPanel>
  );
}

export function OverviewReading({ params }: { params: PipelineOverviewParams }) {
  const { data, view } = useOverviewKpis(params);
  if (!data || !view) return null;
  const spendingPerHundred = data.meMeiPercentage === null
    ? null
    : money(data.meMeiPercentage * 100);

  return (
    <section className="panel flex flex-col p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold">Leitura do período</h2>
        <Store className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Participação de ME e MEI</p>
      <p className="metric mt-4 text-4xl text-primary">
        {valueOrDash(data.meMeiPercentage, percent)}
      </p>
      <p className="mt-3 text-sm leading-relaxed">
        {spendingPerHundred === null
          ? 'Não há dados suficientes para calcular os gastos com microempresas neste período.'
          : `A cada R$ 100,00 em compras, ${spendingPerHundred} foram gastos com microempresas.`}
      </p>
      <div className="mt-6 space-y-3 border-t pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Fonte</span>
          <span className="font-medium">{view.source}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Período</span>
          <span className="text-right font-medium">{view.period}</span>
        </div>
      </div>
    </section>
  );
}
