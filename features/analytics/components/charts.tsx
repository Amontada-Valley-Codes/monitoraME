'use client';

import { useState } from 'react';

import { Area } from '@/components/charts/area';
import { AreaChart } from '@/components/charts/area-chart';
import { Bar } from '@/components/charts/bar';
import { BarChart } from '@/components/charts/bar-chart';
import { BarXAxis } from '@/components/charts/bar-x-axis';
import { Grid } from '@/components/charts/grid';
import { PieCenter } from '@/components/charts/pie-center';
import {
  chartCenterLabelClassName,
  chartCenterValueClassName,
} from '@/components/charts/chart-center-typography';
import { PieChart } from '@/components/charts/pie-chart';
import { PieSlice } from '@/components/charts/pie-slice';
import { ChartTooltip } from '@/components/charts/tooltip';
import { XAxis } from '@/components/charts/x-axis';
import { YAxis } from '@/components/charts/y-axis';
import { Button } from '@/components/ui/button';
import { compactMoney, money, percent, ratio } from '@/shared/lib/format';
import { ReferenceArea } from 'recharts';

export type Series = { key: string; label: string; color: string };
export const EXPENSE_COLORS = [
  'var(--expense-1)',
  'var(--expense-2)',
  'var(--expense-3)',
  'var(--expense-4)',
  'var(--expense-5)',
  'var(--expense-6)',
  'var(--expense-7)',
] as const;
const EXPENSE_COLOR_BY_CODE: Record<string, (typeof EXPENSE_COLORS)[number]> = {
  '30': EXPENSE_COLORS[0],
  '32': EXPENSE_COLORS[1],
  '35': EXPENSE_COLORS[2],
  '39': EXPENSE_COLORS[3],
  '40': EXPENSE_COLORS[4],
  '51': EXPENSE_COLORS[5],
  '52': EXPENSE_COLORS[6],
};
const EXPENSE_SHORT_LABEL_BY_CODE: Record<string, string> = {
  '30': 'Material de consumo',
  '32': 'Distribuição gratuita',
  '35': 'Consultoria',
  '39': 'Serviços de terceiros',
  '40': 'Serviços de TI',
  '51': 'Obras e instalações',
  '52': 'Equipamentos',
};

export function expenseColor(code: string, fallbackIndex = 0) {
  return EXPENSE_COLOR_BY_CODE[code.slice(-2)]
    ?? EXPENSE_COLORS[fallbackIndex % EXPENSE_COLORS.length];
}

export function expenseShortLabel(code: string, fallback: string) {
  return EXPENSE_SHORT_LABEL_BY_CODE[code.slice(-2)] ?? fallback;
}
const chartMoney = (value: unknown) => typeof value === 'number' ? money(value) : 'Dados não publicados';

export function TrendChart({
  data,
  series,
}: {
  data: Record<string, unknown>[];
  series: Series[];
}) {
  return (
    <div className="chart-box min-w-0">
      <AreaChart
        data={data}
        className="h-full w-full"
        style={{ height: '100%' }}
        margin={{ top: 24, right: 28, bottom: 40, left: 70 }}
        animationDuration={500}
        animationEasing='ease-in-out'
      >
        <Grid horizontal numTicksRows={4} />
        <ReferenceArea y1={200} y2={220} strokeDasharray="4 4" />
        {series.map((seriesItem) => (
          <Area
            key={seriesItem.key}
            dataKey={seriesItem.key}
            fill={seriesItem.color}
            stroke={seriesItem.color}
            fillOpacity={seriesItem.key === series[0]?.key ? 0.13 : 0.035}
            strokeWidth={seriesItem.key === series[0]?.key ? 3 : 2}
            showMarkers
          />
        ))}
        <XAxis numTicks={6} />
        <YAxis numTicks={4} formatValue={(value) => compactMoney(value)} />
        <ChartTooltip
          showDatePill={false}
          rows={(point) => series.map((seriesItem) => ({
            color: seriesItem.color,
            label: seriesItem.label,
            value: chartMoney(point[seriesItem.key]),
          }))}
        />
      </AreaChart>
    </div>
  );
}

export function BarsChart({
  data,
  series,
  percentage = false,
  fullWidth = true,
  colorKey,
}: {
  data: Record<string, unknown>[];
  series: Series[];
  percentage?: boolean;
  fullWidth?: boolean;
  colorKey?: string;
}) {
  const margin = fullWidth
    ? { top: 24, right: 28, bottom: 48, left: 72 }
    : { top: 16, right: 16, bottom: 44, left: percentage ? 48 : 72 };

  return (
    <div className={fullWidth ? 'chart-box h-full w-full min-w-0' : 'chart-box'}>
      <BarChart
        data={data}
        xDataKey="name"
        className="h-full w-full"
        aspectRatio={fullWidth ? 'auto' : undefined}
        margin={margin}
        animationDuration={450}
        barGap={fullWidth ? 0.42 : 0.4}
      >
        <Grid horizontal numTicksRows={4} />
        {series.map((seriesItem) => (
          <Bar
            key={seriesItem.key}
            dataKey={seriesItem.key}
            fill={seriesItem.color}
            hoverFill={fullWidth && !colorKey ? 'var(--primary)' : undefined}
            colorKey={colorKey}
          />
        ))}
        <BarXAxis />
        <YAxis
          formatValue={(value) =>
            percentage ? percent(value) : compactMoney(value)
          }
          numTicks={4}
        />
        <ChartTooltip
          showDatePill={false}
          rows={(point) => series.map((seriesItem) => ({
            color: colorKey && typeof point[colorKey] === 'string'
              ? String(point[colorKey])
              : seriesItem.color,
            label: seriesItem.label,
            value: percentage
              ? percent(Number(point[seriesItem.key]))
              : money(Number(point[seriesItem.key])),
          }))}
        />
      </BarChart>
    </div>
  );
}

export function DonutChart({
  data,
  total,
  onSelect,
  fillVerticalSpace = false,
}: {
  data: { name: string; key: string; value: number; percentage?: number; color: string }[];
  total: number;
  onSelect?: (key: string) => void;
  fillVerticalSpace?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const values = data.map((item) => ({
    label: item.name,
    value: item.value,
    color: item.color,
  }));

  return (
    <div
      className={`flex flex-col items-center gap-5 sm:flex-row ${
        fillVerticalSpace ? 'min-h-(--chart-height)' : ''
      }`}
    >
      <div className="size-50 shrink-0">
        <PieChart
          data={values}
          innerRadius={64}
          padAngle={0.025}
          hoveredIndex={hover}
          onHoverChange={setHover}
        >
          <PieCenter>
            {({ value, label, isHovered }) => (
              <div className="px-3 text-center">
                <p className={`${chartCenterValueClassName} whitespace-nowrap text-primary`}>
                  {isHovered
                    ? percent(data[hover ?? -1]?.percentage ?? ratio(value, total))
                    : compactMoney(total)}
                </p>
                <p className={`${chartCenterLabelClassName} mt-1 text-muted-foreground`}>
                  {isHovered ? label : 'do valor considerado'}
                </p>
              </div>
            )}
          </PieCenter>
          {values.map((_, index) => (
            <PieSlice
              key={index}
              index={index}
              showGlow={false}
              hoverEffect="grow"
            />
          ))}
        </PieChart>
      </div>
      <div
        className={`flex w-full flex-col ${
          fillVerticalSpace ? 'justify-between self-stretch' : 'space-y-1'
        }`}
      >
        {data.map((item, index) => (
          <Button
            key={item.key}
            variant="ghost"
            onClick={() => onSelect?.(item.key)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(index)}
            onBlur={() => setHover(null)}
            className="flex h-auto min-h-11 w-full items-center justify-between px-2 text-left font-normal"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: item.color }}
              />
              <span className="text-sm whitespace-normal">{item.name}</span>
            </span>
            <span className="pl-2 text-right">
              <span className="data-value block text-base font-semibold text-foreground">
                {percent(item.percentage ?? ratio(item.value, total))}
              </span>
              <span className="text-muted-foreground block text-xs">
                {compactMoney(item.value)}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
