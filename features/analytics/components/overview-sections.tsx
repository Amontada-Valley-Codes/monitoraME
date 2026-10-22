'use client';

import { ArrowLeftRight, ArrowUpRight, ChartPie, MapPin, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BarsChart, DonutChart, expenseColor, expenseShortLabel, TrendChart } from './charts';
import { ChartPanel } from '@/shared/components/chart-panel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { compactMoney, money, number, percent } from '@/shared/lib/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PipelineOverviewParams } from '../pipeline/types';
import type { OverviewMunicipalityRankingItem } from '../pipeline/view-model';
import { DEFAULT_CHART_ENTER_TRANSITION } from '@/components/charts/animation';
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

export function OverviewMetricCard({ label, value, detail, icon: Icon }: {
  label: string;
  value: string;
  detail: string;
  icon: typeof ChartPie;
}) {
  return (
    <Card className="dashboard-metric analytics-overview-metric gap-0 p-5">
      <div className="analytics-overview-metric-heading">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="analytics-overview-metric-icon"><Icon className="size-4" aria-hidden="true" /></span>
      </div>
      <strong className="metric mt-4 block min-w-0 break-words text-3xl font-semibold leading-tight" title={value}>{value}</strong>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{detail}</p>
    </Card>
  );
}

export function OverviewKpis({ params }: { params: PipelineOverviewParams }) {
  const { data } = useOverviewKpis(params);
  if (!data) return null;

  return (
    <div className="dashboard-metrics analytics-overview-metrics" role="group" aria-label="Indicadores principais">
      <OverviewMetricCard label="Participação de ME e MEI" value={valueOrDash(data.meMeiPercentage, percent)} detail="Sobre o total de compras consideradas" icon={ChartPie} />
      <OverviewMetricCard label="Compras de ME" value={valueOrDash(data.mePurchasesCents, compactMoney)} detail="Valor líquido · reais" icon={Wallet} />
      <OverviewMetricCard label="Percentual de compras com fornecedores no Ceará" value={valueOrDash(data.localPercentage, percent)} detail="Do total no recorte consultado" icon={MapPin} />
      <OverviewMetricCard label="Percentual de compras com fornecedores fora do Ceará" value={valueOrDash(data.outsidePercentage, percent)} detail="Do total no recorte consultado" icon={ArrowUpRight} />
    </div>
  );
}
export function OverviewMunicipalityRanking({ items }: {
  items: OverviewMunicipalityRankingItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="analytics-overview-panel analytics-overview-ranking overflow-hidden rounded-xl border bg-card">
      <div>
        <h2 className="font-semibold">Munic&#237;pios com maior volume de compras de ME</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dez primeiros por valor l&#237;quido. Percentual calculado sobre o total estadual de ME.
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <caption className="sr-only">Ranking dos dez municipios com maior valor liquido de compras de ME</caption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Posi&#231;&#227;o</TableHead>
              <TableHead>Munic&#237;pio</TableHead>
              <TableHead className="text-right">Compras l&#237;quidas de ME</TableHead>
              <TableHead className="text-right">Empenhos</TableHead>
              <TableHead className="text-right">Do total estadual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.tceCode}>
                <TableCell className="font-medium tabular-nums">{item.position}</TableCell>
                <TableCell>
                  <span className="font-medium">{item.municipality}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">Codigo TCE {item.tceCode}</span>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">{money(item.purchasesCents)}</TableCell>
                <TableCell className="text-right tabular-nums">{number(item.commitmentCount)}</TableCell>
                <TableCell className="text-right tabular-nums">{percent(item.totalMePercentage)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
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
      className="analytics-fixed-chart analytics-overview-panel analytics-overview-expenses"
      title="Elementos de despesas"
      description="Valores líquidos dos sete elementos de despesa considerados para ME e MEI"
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
    { key: 'mpe', label: 'Microempresas', color: 'var(--chart-2)' },
  ];
  return (
    <ChartPanel
      className="analytics-fixed-chart dashboard-primary-chart analytics-overview-panel analytics-overview-evolution"
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

export function OverviewDistribution({ params }: { params: PipelineOverviewParams }) {
  const [activeView, setActiveView] = useState<'businessSizes' | 'destinations'>('businessSizes');
  const [isSwitching, setIsSwitching] = useState(false);
  const businessSizes = useOverviewBusinessSizes(params);
  const destinations = useOverviewDestinations(params);
  const showingBusinessSizes = activeView === 'businessSizes';
  const rows = showingBusinessSizes
    ? businessSizes.data ?? []
    : destinations.data ?? [];
  const status = showingBusinessSizes ? businessSizes.status : destinations.status;
  const retry = showingBusinessSizes ? businessSizes.retry : destinations.retry;
  const title = showingBusinessSizes
    ? 'Participa\u00e7\u00e3o por porte empresarial'
    : 'Destino dos recursos';
  const nextTitle = showingBusinessSizes
    ? 'Destino dos recursos'
    : 'Porte empresarial';
  const total = showingBusinessSizes
    ? businessSizes.view?.totalCents ?? 0
    : rows.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    if (!isSwitching || status === 'loading') return;
    const timer = window.setTimeout(() => setIsSwitching(false), status === 'ready' && rows.length > 0
      ? ((DEFAULT_CHART_ENTER_TRANSITION.duration ?? 1.1) + 0.1 + Math.max(0, rows.length - 1) * 0.08) * 1000
      : 0);
    return () => window.clearTimeout(timer);
  }, [activeView, isSwitching, rows.length, status]);

  return (
    <ChartPanel
      belowTitleAction={(
        <Button
          aria-label={nextTitle}
          className="min-h-9 gap-2"
          disabled={isSwitching}
          onClick={() => {
            setIsSwitching(true);
            setActiveView(showingBusinessSizes ? 'destinations' : 'businessSizes');
          }}
          variant="outline"
        >
          <ArrowLeftRight aria-hidden="true" />
          <span>{nextTitle}</span>
        </Button>
      )}
      className="analytics-overview-panel analytics-overview-donut"
      description={showingBusinessSizes ? 'Percentual do valor l\u00edquido anual' : 'Origem das compras de ME e MEI'}
      empty={status === 'ready' && rows.length === 0}
      onRetry={retry}
      rows={rows.map((item) => ({ label: item.name, values: [money(item.value)] }))}
      state={status}
      title={title}
    >
      <DonutChart key={activeView} data={rows} total={total} />
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
