'use client';

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

export function OverviewKpis({ params }: { params: PipelineOverviewParams }) {
  const { data, view } = useOverviewKpis(params);
  if (!data || !view) return null;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Participação de ME e MEI"
        value={valueOrDash(data.meMeiPercentage, percent)}
        detail="Percentual informado pelo pipeline"
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
  );
}

export function OverviewExpenses({ params }: { params: PipelineOverviewParams }) {
  const { data, status, retry } = useOverviewExpenseElements(params);
  const rows = data ?? [];
  return (
    <ChartPanel
      className="flex flex-col"
      contentClassName="flex min-h-0 flex-1"
      title="Elementos de despesas"
      description="Valores consolidados pelo pipeline"
      legend={[{ label: 'Valor empenhado líquido', color: 'var(--chart-1)' }]}
      rows={rows.map((item) => ({ label: item.name, values: [money(item.value)] }))}
      state={status}
      onRetry={retry}
      empty={status === 'ready' && rows.length === 0}
    >
      <BarsChart
        data={rows.map((item) => ({
          name: item.key.slice(-2),
          label: item.name,
          value: item.value,
        }))}
        series={[{ key: 'value', label: 'Valor considerado', color: 'var(--chart-1)' }]}
        fullWidth
      />
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
      description="Percentual do valor considerado"
      rows={rows.map((item) => ({ label: item.name, values: [money(item.value)] }))}
      state={status}
      onRetry={retry}
      empty={status === 'ready' && rows.length === 0}
    >
      <DonutChart data={rows} total={view?.totalCents ?? 0} fillVerticalSpace />
    </ChartPanel>
  );
}

export function OverviewDestinations({ params }: { params: PipelineOverviewParams }) {
  const { data, status, retry, view } = useOverviewDestinations(params);
  const rows = data ?? [];
  return (
    <ChartPanel
      title="Destino dos recursos"
      description="Origem do estabelecimento em relação ao município comprador"
      rows={rows.map((item) => ({ label: item.name, values: [money(item.value)] }))}
      state={status}
      onRetry={retry}
      empty={status === 'ready' && rows.length === 0}
    >
      <DonutChart data={rows} total={view?.totalCents ?? 0} />
    </ChartPanel>
  );
}

export function OverviewReading({ params }: { params: PipelineOverviewParams }) {
  const { data, view } = useOverviewKpis(params);
  if (!data || !view) return null;
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
        O percentual é exibido como calculado pelo pipeline, sem recomposição no navegador.
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
