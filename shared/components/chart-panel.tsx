'use client';

import { useState, type ReactNode } from 'react';
import { Table2, ChartNoAxesCombined } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { EmptyState, ErrorState } from './states';
import type { LoadState } from '@/features/analytics/data/types';

export function ChartPanel({
  title,
  description,
  children,
  legend,
  rows,
  state = 'ready',
  onRetry = () => {},
  empty = false,
  action,
  className = '',
  contentClassName = '',
}: {
  title: string;
  description?: string;
  children: ReactNode;
  legend?: { label: string; color: string }[];
  rows: { label: string; values: string[] }[];
  state?: LoadState;
  onRetry?: () => void;
  empty?: boolean;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const [view, setView] = useState('chart');

  return (
    <section className={`panel min-w-0 p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="h-9">
              <TabsTrigger
                value="chart"
                aria-label={`Ver gráfico: ${title}`}
                className="h-8"
              >
                <ChartNoAxesCombined className="size-4" />
              </TabsTrigger>
              <TabsTrigger
                value="table"
                aria-label={`Ver tabela: ${title}`}
                className="h-8"
              >
                <Table2 className="size-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {legend && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}

      <div className={`mt-4 ${contentClassName}`}>
        {state === 'loading' ? (
          <Skeleton className="chart-box w-full" />
        ) : state === 'error' ? (
          <ErrorState onRetry={onRetry} />
        ) : empty ? (
          <EmptyState />
        ) : view === 'table' ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria / período</TableHead>
                {(legend?.map((item) => item.label) ?? ['Valor']).map(
                  (label) => (
                    <TableHead key={label} className="text-right">
                      {label}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  {row.values.map((value, index) => (
                    <TableCell
                      key={index}
                      className="text-right text-xs data-value"
                    >
                      {value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div
            className="h-full"
            role="group"
            aria-label={`${title}. ${description ?? ''} Use Ver tabela para acessar todos os valores.`}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}