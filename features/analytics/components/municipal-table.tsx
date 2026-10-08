'use client';

import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/shared/components/data-table';
import { compactMoney, percent, ratio } from '@/shared/lib/format';
import { useProtectedNavigate } from '@/shared/auth/protected-navigation';
import { useAnalytics } from '../data/context';
import { TCE_MUNICIPALITIES } from '../pipeline/municipalities';
import type { AnalyticsResult } from '../data/repository';

type Row = AnalyticsResult['municipalities'][number];
const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

export function MunicipalTable({ rows, compact = false }: { rows: Row[]; compact?: boolean }) {
  const { filters } = useAnalytics();
  const protectedNavigate = useProtectedNavigate();
  const openMunicipality = (row: Row) => {
    const code = TCE_MUNICIPALITIES.find((item) => normalized(item.name) === normalized(row.name))?.code;
    if (!code) return;
    const params = new URLSearchParams({ municipality_tce_code: code, start_date: filters.start, end_date: filters.end });
    void protectedNavigate(`/analitico/municipios?${params}`);
  };
  const columns: Column<Row>[] = [
    { key: 'name', label: 'Município', get: (row) => row.name, render: (row) => <div><Button variant="link" className="h-auto min-h-0 p-0 font-semibold text-foreground" onClick={() => openMunicipality(row)}>{row.name}<ArrowUpRight className="size-3.5 text-muted-foreground" /></Button><p className="mt-1 text-xs text-muted-foreground">{row.region} · CE</p></div> },
    { key: 'total', label: 'Compras consideradas', get: (row) => row.total, render: (row) => <span className="data-value text-sm">{compactMoney(row.total)}</span>, align: 'right' },
    { key: 'mpe', label: 'Participação de ME', get: (row) => ratio(row.mpe, row.total), render: (row) => <span className="data-value text-sm text-success">{row.count ? percent(ratio(row.mpe, row.total)) : '—'}</span>, align: 'right' },
    ...(filters.origin === 'all' ? [
      { key: 'local', label: 'Fornecedores locais', get: (row: Row) => ratio(row.local, row.total), render: (row: Row) => <span className="data-value text-sm text-primary">{row.count ? percent(ratio(row.local, row.total)) : '—'}</span>, align: 'right' as const },
      { key: 'evasion', label: 'Evasão', get: (row: Row) => ratio(row.external, row.total), render: (row: Row) => <span className="data-value text-sm">{row.count ? percent(ratio(row.external, row.total)) : '—'}</span>, align: 'right' as const },
    ] : []),
    { key: 'status', label: 'Cobertura', get: (row) => row.count ? 'Disponível' : 'Sem dados', render: (row) => <Badge variant="outline" className={row.count ? 'border-primary/10 bg-secondary/40 text-primary' : 'text-muted-foreground'}>{row.count ? 'Disponível' : 'Sem dados'}</Badge> },
  ];
  return <DataTable rows={rows} columns={columns} title={compact ? 'Panorama dos municípios' : 'Municípios cearenses'} searchPlaceholder="Buscar município ou região..." initialSort="total" pageSize={8} />;
}
