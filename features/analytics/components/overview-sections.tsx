'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight, CalendarRange, ChartPie, MapPin, Sparkles, Store, Wallet } from 'lucide-react';

import { BarsChart, DonutChart, expenseColor, expenseShortLabel, TrendChart } from './charts';
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
    <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2 xl:grid-rows-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          label="Participação de ME e MEI"
          value={valueOrDash(data.meMeiPercentage, percent)}
          detail="Percentual de compras de Microempresas e Empresas de Pequeno Porte"
          change={null}
          icon={ChartPie}
          sizeScope="ME + MEI"
          highlight
          tone="blue"
        />
        <KpiCard
          label="Total de compras de ME"
          value={valueOrDash(data.mePurchasesCents, compactMoney)}
          detail="Valor líquido em reais"
          change={null}
          icon={Wallet}
          sizeScope="ME"
          tone="violet"
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
          tone="teal"
        />
        <KpiCard
          label="Recursos fora do município"
          value={valueOrDash(data.outsidePercentage, percent)}
          detail="Percentual consolidado para o período"
          change={null}
          icon={ArrowUpRight}
          inverse
          tone="amber"
        />
      </div>
    </div>
  );
}

export function OverviewExpenses({ params }: { params: PipelineOverviewParams }) {
  const { data, status, retry } = useOverviewExpenseElements(params);
  const rows = (data ?? []).map((item, index) => ({
    ...item,
    color: expenseColor(item.key, index),
    shortLabel: expenseShortLabel(item.key, item.name),
  }));
  return (
    <ChartPanel
      title="Elementos de despesas"
      description="Valores líquidos dos sete elementos de despesa considerados exclusivamente para microempresas"
      legend={rows.map((item) => ({ label: item.shortLabel, color: item.color }))}
      rows={rows.map((item) => ({ label: item.name, values: [money(item.value)] }))}
      state={status}
      onRetry={retry}
      empty={status === 'ready' && rows.length === 0}
    >
      <div className="h-(--chart-height) min-h-(--chart-height) w-full">
        <BarsChart
          data={rows.map((item) => ({
            name: item.key.slice(-2),
            label: item.shortLabel,
            color: item.color,
            value: item.value,
          }))}
          series={[{ key: 'value', label: 'Valor líquido', color: 'var(--chart-1)' }]}
          fullWidth
          colorKey="color"
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

// export function OverviewReading({ params }: { params: PipelineOverviewParams }) {
//   const { data, view } = useOverviewKpis(params);
//   if (!data || !view) return null;
//   const spendingPerHundred = data.meMeiPercentage === null
//     ? null
//     : money(data.meMeiPercentage * 100);
//   const participationWidth = data.meMeiPercentage === null ? 0 : Math.min(100, Math.max(0, data.meMeiPercentage));
//   const [periodStart, periodEnd] = view.period.split(' a ');
//   const formatDate = (value?: string) => {
//     if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value ?? '—';
//     const [year, month, day] = value.split('-');
//     return `${day}/${month}/${year}`;
//   };

//   return (
//     <section className="panel relative flex flex-col overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 p-6" aria-labelledby="period-reading-title">
//       <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-emerald-400" />
//       <div className="mb-6 flex items-start justify-between gap-4">
//         <div>
//           <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary"><Sparkles className="size-3" />Resumo executivo</span>
//           <h2 id="period-reading-title" className="mt-3 text-lg font-semibold">Leitura do período</h2>
//           <p className="mt-1 text-xs leading-5 text-muted-foreground">O que os números revelam sobre a participação dos pequenos negócios.</p>
//         </div>
//         <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-card text-primary shadow-sm"><Store className="size-5" /></div>
//       </div>

//       <div className="rounded-2xl border bg-card/85 p-5 shadow-sm">
//         <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Participação de ME e MEI</p>
//         <div className="mt-2 flex items-end justify-between gap-3">
//           <p className="metric text-4xl font-semibold tracking-tight text-primary sm:text-5xl">{valueOrDash(data.meMeiPercentage, percent)}</p>
//           {/* <span className="pb-1 text-right text-xs text-muted-foreground">das compras analisadas</span> */}
//         </div>
//         <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div className="h-full rounded-full bg-linear-to-r from-primary to-emerald-500 transition-[width] duration-500" style={{ width: `${participationWidth}%` }} /></div>
//         <p className="mt-4 text-sm leading-6 text-foreground">
//           {spendingPerHundred === null
//             ? 'Ainda não há dados suficientes para medir a participação dos pequenos negócios neste período.'
//             : <>De cada <strong>R$ 100,00</strong> em compras consideradas, <strong className="text-primary">{spendingPerHundred}</strong> foram destinados a ME e MEI.</>}
//         </p>
//       </div>

//       <dl className="mt-5 grid gap-3 text-sm">
//         <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/55 p-3">
//           <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary"><Wallet className="size-4" /></div>
//           <div className="min-w-0"><dt className="text-xs text-muted-foreground">Compras de microempresas</dt><dd className="mt-0.5 font-semibold">{valueOrDash(data.mePurchasesCents, money)}</dd></div>
//         </div>
//         <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/55 p-3">
//           <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><MapPin className="size-4" /></div>
//           <div className="min-w-0"><dt className="text-xs text-muted-foreground">Compras com fornecedores locais</dt><dd className="mt-0.5 font-semibold">{valueOrDash(data.localPercentage, percent)}</dd></div>
//         </div>
//         <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/55 p-3">
//           <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><CalendarRange className="size-4" /></div>
//           <div className="min-w-0"><dt className="text-xs text-muted-foreground">Período analisado</dt><dd className="mt-0.5 font-medium tabular-nums">{formatDate(periodStart)} a {formatDate(periodEnd)}</dd></div>
//         </div>
//       </dl>

//       <p className="mt-auto border-t pt-4 text-[11px] leading-4 text-muted-foreground">Fonte: dados públicos consolidados e tratados pelo MonitoraME.</p>
//     </section>
//   );
// }
