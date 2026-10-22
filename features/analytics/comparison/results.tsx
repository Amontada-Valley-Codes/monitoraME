'use client';

import { ArrowUpRight, Equal, Minus, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { PieCenter } from '@/components/charts/pie-center';
import { PieChart } from '@/components/charts/pie-chart';
import { PieSlice } from '@/components/charts/pie-slice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChartPanel } from '@/shared/components/chart-panel';
import { money, number, percent, points } from '@/shared/lib/format';
import { BarsChart, expenseShortLabel, TrendChart, type Series } from '../components/charts';
import {
  companySizeLabel,
  formatCompetence,
  supplierOriginLabel,
} from '../commitments/detail-format';
import { comparisonSideSummary, comparisonState, evolutionRows } from './model';
import type { ComparisonMode, ComparisonResponse, ValueComparison } from './types';

const LEFT_COLOR = 'var(--chart-1)';
const RIGHT_COLOR = 'var(--chart-2)';
const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];
const KPI_LABELS: Record<string, string> = {
  percentual_participacao_me: 'Participação de ME',
  total_compras_ME_centavos: 'Compras de ME',
  percentual_compras_fornecedores_locais: 'Fornecedores locais',
  percentual_recursos_fora_municipio: 'Recursos fora do município',
};
const MODE_LABELS: Record<ComparisonMode, string> = {
  PERIODS: 'Períodos',
  MUNICIPALITIES: 'Municípios',
  MIXED: 'Municípios e períodos',
};

export function ComparisonResults({ data }: { data: ComparisonResponse }) {
  const timeline = evolutionRows(data.sections.evolucao_compras_consideradas);
  const missing = [
    ...data.left.overview.competencias_ausentes.map(
      (item) => `${data.left.label}: ${formatCompetence(item)}`,
    ),
    ...data.right.overview.competencias_ausentes.map(
      (item) => `${data.right.label}: ${formatCompetence(item)}`,
    ),
  ];
  const failures =
    data.left.overview.falhas_competencias.length +
    data.right.overview.falhas_competencias.length;
  const mode = data.comparison_mode as ComparisonMode;
  const series: Series[] = [
    { key: 'left', label: data.left.label, color: LEFT_COLOR },
    { key: 'right', label: data.right.label, color: RIGHT_COLOR },
  ];

  const expenseData = data.sections.elementos_despesa.map((item) => ({
    name: item.codigo,
    label: expenseShortLabel(item.codigo, item.nome),
    left: item.left.value ?? undefined,
    right: item.right.value ?? undefined,
  }));

  return (
    <section
      id="comparison-results"
      className="mt-8 scroll-mt-24 space-y-6"
      aria-labelledby="comparison-results-title"
      aria-live="polite"
    >
      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="eyebrow text-primary">Resultado da comparação</p>
            <h2 id="comparison-results-title" className="mt-1 text-xl font-semibold">
              {data.left.label} × {data.right.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore os gráficos ou alterne para a visualização em tabela em cada seção.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            {MODE_LABELS[mode] ?? 'Comparação'}
          </Badge>
        </div>
        <div className="grid md:grid-cols-2">
          <SideSummary side={data.left} tone="left" />
          <SideSummary side={data.right} tone="right" />
        </div>
      </div>

      {missing.length > 0 && (
        <Alert>
          <AlertTitle>Dados incompletos neste recorte</AlertTitle>
          <AlertDescription>
            Competências não publicadas: {missing.join(', ')}.
          </AlertDescription>
        </Alert>
      )}
      {failures > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Falhas em competências</AlertTitle>
          <AlertDescription>
            Uma ou mais competências não puderam ser processadas integralmente.
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="main-indicators-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 id="main-indicators-title" className="text-lg font-semibold">
              Indicadores principais
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Valores dos dois recortes e diferença absoluta.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.sections.kpis.map((item) => (
            <ComparisonCard
              key={item.indicator}
              title={KPI_LABELS[item.indicator] ?? item.indicator}
              value={item}
            />
          ))}
        </div>
      </section>

      <EvolutionComparisonChart
        rows={timeline}
        leftLabel={data.left.label}
        rightLabel={data.right.label}
      />

      <DualPiePanel
        title="Participação por porte"
        description="Distribuição percentual de cada recorte por porte empresarial"
        leftLabel={data.left.label}
        rightLabel={data.right.label}
        items={data.sections.participacao_por_porte_empresarial.map((item) => ({
          label: companySizeLabel(item.porte),
          value: item.valor_centavos,
          percentage: item.percentual,
        }))}
      />

      <DualPiePanel
        title="Destino dos recursos"
        description="Distribuição percentual de cada recorte conforme a origem do fornecedor"
        leftLabel={data.left.label}
        rightLabel={data.right.label}
        items={data.sections.destino_recursos.map((item) => ({
          label: supplierOriginLabel(item.destino),
          value: item.valor_centavos,
          percentage: item.percentual,
        }))}
      />

      <ChartPanel
        className="analytics-fixed-chart"
        title="Elementos de despesa"
        description="Valores líquidos empenhados por classificação da despesa"
        legend={series}
        rows={data.sections.elementos_despesa.map((item) => ({
          label: `${item.codigo} · ${item.nome}`,
          values: [
            sideValueLabel(item.left.value, item.unit),
            sideValueLabel(item.right.value, item.unit),
          ],
        }))}
        empty={expenseData.length === 0}
      >
        <div className="h-(--chart-height) min-h-(--chart-height)">
          <BarsChart data={expenseData} series={series} />
        </div>
      </ChartPanel>
    </section>
  );
}

type PieComparisonItem = {
  label: string;
  value: ValueComparison;
  percentage: ValueComparison;
};

function DualPiePanel({
  title,
  description,
  leftLabel,
  rightLabel,
  items,
}: {
  title: string;
  description: string;
  leftLabel: string;
  rightLabel: string;
  items: PieComparisonItem[];
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="border-b p-5 sm:p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-2">
        <SidePie label={leftLabel} side="left" items={items} />
        <SidePie label={rightLabel} side="right" items={items} />
      </div>
    </section>
  );
}

function SidePie({
  label,
  side,
  items,
}: {
  label: string;
  side: 'left' | 'right';
  items: PieComparisonItem[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartData = items.map((item, index) => ({
    label: item.label,
    value: item.percentage[side].value ?? 0,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));
  const hasData = items.some((item) => item.percentage[side].value !== null);

  return (
    <article className="min-w-0">
      <h3 className="text-center text-sm font-semibold">{label}</h3>
      <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row">
        <div className="size-48 shrink-0">
          {hasData ? (
            <PieChart
              data={chartData}
              innerRadius={64}
              padAngle={0.025}
              hoveredIndex={hoveredIndex}
              onHoverChange={setHoveredIndex}
            >
              <PieCenter>
                {({ value, label: activeLabel, isHovered }) => (
                  <div className="px-3 text-center">
                    <p className="metric whitespace-nowrap text-[clamp(1rem,16cqw,1.75rem)] font-semibold leading-none text-primary">
                      {percent(value)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isHovered ? activeLabel : 'do recorte'}
                    </p>
                  </div>
                )}
              </PieCenter>
              {chartData.map((item, index) => (
                <PieSlice
                  key={item.label}
                  index={index}
                  showGlow={false}
                  hoverEffect="grow"
                />
              ))}
            </PieChart>
          ) : (
            <div className="grid size-full place-items-center rounded-full border border-dashed text-xs text-muted-foreground">
              Indisponível
            </div>
          )}
        </div>
        <div className="w-full space-y-2.5">
          {items.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              className="flex w-full items-start justify-between gap-3 rounded-md p-1.5 text-left text-xs transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex min-w-0 items-start gap-2">
                <span
                  className="mt-1 size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </span>
              <span className="data-value shrink-0 text-right">
                <span className="block">
                  {sideValueLabel(item.value[side].value, item.value.unit)}
                </span>
                <span className="text-muted-foreground">
                  {item.percentage[side].value === null
                    ? 'Indisponível'
                    : percent(item.percentage[side].value)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function SideSummary({
  side,
  tone,
}: {
  side: ComparisonResponse['left'];
  tone: 'left' | 'right';
}) {
  const summary = comparisonSideSummary(side);
  const periods = side.overview.competencias_solicitadas;
  const period = periods.length
    ? `${formatCompetence(periods[0])}${
        periods.length > 1 ? ` a ${formatCompetence(periods.at(-1)!)}` : ''
      }`
    : 'Período não informado';
  const color = tone === 'left' ? LEFT_COLOR : RIGHT_COLOR;

  return (
    <article className="relative min-w-0 p-5 sm:p-6 md:last:border-l">
      <span
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <h3 className="truncate font-semibold">{side.label}</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {summary.location} · {period}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {summary.status}
        </Badge>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-muted-foreground">Empenhos filtrados</dt>
          <dd className="data-value mt-1 text-lg">
            {number(summary.commitments)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{summary.coverageLabel}</dt>
          <dd className="data-value mt-1 text-lg">
            {percent(summary.coverage)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function ComparisonCard({ title, value }: { title: string; value: ValueComparison }) {
  const state = comparisonState(value);
  const status =
    state === 'tie'
      ? 'Valores iguais'
      : state === 'unavailable'
        ? 'Comparação indisponível'
        : `${value.higher?.label ?? (state === 'left' ? value.left.label : value.right.label)} tem o maior valor`;
  const StatusIcon =
    state === 'tie' ? Equal : state === 'unavailable' ? Minus : ArrowUpRight;

  return (
    <article className="panel relative overflow-hidden p-5 sm:p-6">
      <div
        className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-chart-1 to-chart-2"
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <StatusIcon className="size-3.5" aria-hidden="true" />
            {status}
          </p>
        </div>
        <TrendingUp className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ValueSide
          side={value.left}
          unit={value.unit}
          tone="left"
          highlighted={state === 'left'}
        />
        <ValueSide
          side={value.right}
          unit={value.unit}
          tone="right"
          highlighted={state === 'right'}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4 text-xs">
        <span className="text-muted-foreground">Diferença absoluta</span>
        <span className="data-value font-medium">{differenceLabel(value)}</span>
      </div>
    </article>
  );
}

function ValueSide({
  side,
  unit,
  tone,
  highlighted,
}: {
  side: ValueComparison['left'];
  unit: ValueComparison['unit'];
  tone: 'left' | 'right';
  highlighted: boolean;
}) {
  const color = tone === 'left' ? LEFT_COLOR : RIGHT_COLOR;
  return (
    <div
      className={`rounded-lg border p-3 ${highlighted ? 'bg-muted/60 shadow-sm' : 'bg-background/50'}`}
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <p className="truncate text-xs text-muted-foreground" title={side.label}>
        {side.label}
      </p>
      <p className="data-value mt-1 text-lg font-semibold">
        {sideValueLabel(side.value, unit)}
      </p>
    </div>
  );
}

function EvolutionComparisonChart({
  rows,
  leftLabel,
  rightLabel,
}: {
  rows: ReturnType<typeof evolutionRows>;
  leftLabel: string;
  rightLabel: string;
}) {
  const series: Series[] = [
    { label: leftLabel, color: LEFT_COLOR },
    { label: rightLabel, color: RIGHT_COLOR },
  ].map((item, index) => ({ ...item, key: index === 0 ? 'left' : 'right' }));

  return (
    <ChartPanel
      className="analytics-fixed-chart"
      title="Evolução mensal"
      description="Valores mensais de compras consideradas, sem acumulação"
      legend={series}
      rows={rows.map((row) => ({
        label: row.label,
        values: [
          row.left === null ? 'Indisponível' : money(row.left),
          row.right === null ? 'Indisponível' : money(row.right),
        ],
      }))}
      empty={rows.length === 0}
    >
      <TrendChart data={rows} series={series} />
    </ChartPanel>
  );
}

function sideValueLabel(value: number | null, unit: ValueComparison['unit']) {
  return value === null
    ? 'Indisponível'
    : unit === 'CENTAVOS'
      ? money(value)
      : percent(value);
}

function differenceLabel(value: ValueComparison) {
  return comparisonState(value) === 'unavailable' || value.absolute_difference === null
    ? 'Indisponível'
    : comparisonState(value) === 'tie'
      ? 'Empate'
      : value.unit === 'CENTAVOS'
        ? money(value.absolute_difference)
        : points(value.absolute_difference);
}

