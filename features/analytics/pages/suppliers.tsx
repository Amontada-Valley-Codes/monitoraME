'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '../components/page-header';
import { GlobalFilters } from '../components/global-filters';
import { useAnalytics } from '../data/context';
import { DataTable, type Column } from '@/shared/components/data-table';
import { SelectField } from '@/shared/components/select-field';
import { LoadingState, ErrorState } from '@/shared/components/states';
import { ExportButton } from '@/shared/components/export-button';
import { exportDataset } from '../data/export-datasets';
import { compactMoney, number } from '@/shared/lib/format';
import type { AnalyticsResult } from '../data/repository';

type Row = AnalyticsResult['suppliers'][number];

export default function Suppliers() {
  const { data, state, reload, filters, navigate } = useAnalytics();
  const [status, setStatus] = useState('all');
  const [nature, setNature] = useState('all');
  const [city, setCity] = useState('all');

  const rows =
    data?.suppliers.filter(
      (s) =>
        (status === 'all' || s.status === status) &&
        (nature === 'all' || s.nature === nature) &&
        (city === 'all' || s.ibge === city)
    ) ?? [];

  const columns: Column<Row>[] = [
    {
      key: 'name',
      label: 'Razão social / CNPJ',
      get: (s) => s.name + ' ' + s.cnpj,
      render: (s) => (
        <div>
          <Button
            variant="link"
            className="h-auto min-h-0 p-0 text-left font-medium text-foreground whitespace-normal"
            onClick={() => navigate('/analitico/fornecedores/' + s.id)}
          >
            {s.name}
            <ArrowUpRight className="size-3 shrink-0" />
          </Button>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {s.cnpj}
          </p>
        </div>
      ),
    },
    {
      key: 'size',
      label: 'Porte',
      get: (s) => s.size,
      render: (s) => (
        <Badge variant="outline">
          {s.size === 'NI' ? 'Não identificado' : s.size}
        </Badge>
      ),
    },
    {
      key: 'city',
      label: 'Estabelecimento',
      get: (s) => s.city,
      render: (s) => (
        <span>
          {s.city}
          <span className="block text-xs text-muted-foreground">{s.uf}</span>
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Situação cadastral',
      get: (s) => s.status,
      render: (s) => (
        <Badge
          variant="outline"
          className={
            s.status === 'Ativa'
              ? 'bg-success-soft text-success'
              : 'bg-muted text-muted-foreground'
          }
        >
          {s.status}
        </Badge>
      ),
    },
    {
      key: 'count',
      label: 'Empenhos',
      get: (s) => s.count,
      render: (s) => number(s.count),
      align: 'right',
    },
    {
      key: 'total',
      label: 'Valor considerado',
      get: (s) => s.total,
      render: (s) => (
        <span className="data-value text-sm">{compactMoney(s.total)}</span>
      ),
      align: 'right',
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Ecossistema empresarial"
        title="Fornecedores"
        description="Explore os estabelecimentos presentes nas compras do período selecionado."
        actions={
          data && (
            <ExportButton
              filters={filters}
              dataset={exportDataset(
                { ...data, suppliers: rows },
                'fornecedores'
              )}
            />
          )
        }
      />
      <GlobalFilters />
      <div className="mb-5 flex flex-wrap gap-3">
        <SelectField
          label="Situação cadastral"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'Todas as situações' },
            ...['Ativa', 'Baixada', 'Não identificada'].map((s) => ({
              value: s,
              label: s,
            })),
          ]}
        />
        <SelectField
          label="Natureza jurídica"
          value={nature}
          onChange={setNature}
          options={[
            { value: 'all', label: 'Todas as naturezas jurídicas' },
            ...[
              'Sociedade empresária limitada',
              'Empresário individual',
            ].map((s) => ({ value: s, label: s })),
          ]}
        />
        <SelectField
          label="Município do estabelecimento"
          value={city}
          onChange={setCity}
          options={[
            { value: 'all', label: 'Todos os estabelecimentos' },
            ...Array.from(
              new Map(
                data?.suppliers
                  .filter((s) => s.ibge)
                  .map((s) => [
                    s.ibge,
                    { value: s.ibge, label: s.city + ' / ' + s.uf },
                  ])
              ).values()
            ),
          ]}
        />
      </div>
      {state === 'loading' ? (
        <LoadingState />
      ) : state === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : (
        <DataTable
          rows={rows}
          columns={columns}
          initialSort="total"
          title="Empresas e estabelecimentos"
          searchPlaceholder="Buscar razão social ou CNPJ..."
        />
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Os nomes e CNPJs desta demonstração são ilustrativos. Dados pessoais de
        representantes não são exibidos.
      </p>
    </>
  );
}