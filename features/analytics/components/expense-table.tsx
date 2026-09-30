'use client';

import { DataTable, type Column } from '@/shared/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';
import { money, dateLabel } from '@/shared/lib/format';
import { useAnalytics } from '../data/context';
import { MUNICIPALITIES, SUPPLIERS, CATEGORIES } from '../data/fixtures';
import type { Expense } from '../data/types';

export function ExpenseTable({ rows }: { rows: Expense[] }) {
  const { navigate } = useAnalytics();

  const columns: Column<Expense>[] = [
    {
      key: 'id',
      label: 'Empenho',
      get: (r) => r.id,
      render: (r) => (
        <Button
          variant="link"
          className="h-auto min-h-0 p-0 font-mono text-xs"
          onClick={() => navigate('/analitico/despesas/' + r.id)}
        >
          {r.id}
          <ArrowUpRight className="size-3" />
        </Button>
      ),
    },
    {
      key: 'date',
      label: 'Data',
      get: (r) => r.date,
      render: (r) => dateLabel(r.date),
    },
    {
      key: 'municipality',
      label: 'Município comprador',
      get: (r) => MUNICIPALITIES.find((m) => m.id === r.municipality)?.name ?? '',
    },
    {
      key: 'supplier',
      label: 'Fornecedor / porte',
      get: (r) =>
        (SUPPLIERS.find((s) => s.id === r.supplier)?.name ?? '') + ' ' + r.size,
      render: (r) => (
        <div className="max-w-56 whitespace-normal">
          <Button
            variant="link"
            className="h-auto min-h-0 justify-start p-0 text-left text-sm whitespace-normal text-foreground"
            onClick={() => navigate('/analitico/fornecedores/' + r.supplier)}
          >
            {SUPPLIERS.find((s) => s.id === r.supplier)?.name}
          </Button>
          <Badge variant="outline" className="mt-1 block w-fit text-xs">
            {r.size === 'NI' ? 'Não identificado' : r.size}
          </Badge>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Elemento de despesa',
      get: (r) =>
        r.category +
        ' ' +
        CATEGORIES.find((c) => c.id === r.category)?.name,
      render: (r) => <span className="data-value text-xs">{r.category}</span>,
    },
    {
      key: 'net',
      label: 'Empenhado líquido',
      get: (r) => r.net,
      render: (r) => (
        <span className="data-value text-sm">{money(r.net)}</span>
      ),
      align: 'right',
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      title="Notas de empenho"
      searchPlaceholder="Buscar empenho ou fornecedor..."
      initialSort="net"
    />
  );
}