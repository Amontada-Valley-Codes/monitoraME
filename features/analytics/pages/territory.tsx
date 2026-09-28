'use client';

import { MapPin, ArrowUpRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '../components/page-header';
import { GlobalFilters } from '../components/global-filters';
import { useAnalytics } from '../data/context';
import { ChartPanel } from '@/shared/components/chart-panel';
import { DonutChart, BarsChart } from '../components/charts';
import { KpiCard } from '@/shared/components/kpi-card';
import { DataTable, type Column } from '@/shared/components/data-table';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { money, compactMoney, percent, ratio, delta } from '@/shared/lib/format';
import { ExportButton } from '@/shared/components/export-button';
import { SUPPLIERS } from '../data/fixtures';

export default function Territory() {
  const { data, state, filters, reload, reset, setFilters } = useAnalytics();
  const summary = data?.summary;
  const previous = data?.previous;

  // Group row values by supplier IBGE code
  const groups = new Map<string, { id: string; name: string; uf: string; total: number }>();

  data?.rows.forEach((row) => {
    const supplier = SUPPLIERS.find((s) => s.id === row.supplier)!;
    const key = supplier.ibge || 'NI';
    const group = groups.get(key) ?? {
      id: key,
      name: supplier.city,
      uf: supplier.uf,
      total: 0,
    };

    group.total += row.net;
    groups.set(key, group);
  });

  const destinations = Array.from(groups.values()).sort((a, b) => b.total - a.total);
  type Row = (typeof destinations)[number];

  const columns: Column<Row>[] = [
    {
      key: 'name',
      label: 'Município do fornecedor',
      get: (row) => row.name,
    },
    {
      key: 'id',
      label: 'Código IBGE',
      get: (row) => row.id,
    },
    {
      key: 'uf',
      label: 'UF',
      get: (row) => row.uf,
    },
    {
      key: 'total',
      label: 'Valor considerado',
      get: (row) => row.total,
      render: (row) => <span className="data-value text-sm">{money(row.total)}</span>,
      align: 'right',
    },
    {
      key: 'share',
      label: 'Participação',
      get: (row) => ratio(row.total, summary?.total ?? 0),
      render: (row) => percent(ratio(row.total, summary?.total ?? 0)),
      align: 'right',
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Distribuição territorial"
        title="Para onde vão os recursos?"
        description="Observe a origem dos estabelecimentos e a circulação das compras municipais."
        actions={
          <ExportButton
            filters={filters}
            dataset={{
              title: 'Destino dos recursos',
              columns: ['Município do estabelecimento', 'Código IBGE', 'UF', 'Valor (R$)'],
              rows: destinations.map((d) => [d.name, d.id, d.uf, d.total / 100]),
            }}
          />
        }
      />

      <GlobalFilters />

      {state === 'loading' ? (
        <LoadingState />
      ) : state === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : !summary?.count ? (
        <EmptyState onReset={reset} />
      ) : (
        <>
          {filters.origin === 'all' ? (
            <>
              {/* KPI Cards Section */}
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <KpiCard
                  label="Retenção no município comprador"
                  value={percent(ratio(summary.local, summary.total))}
                  detail={compactMoney(summary.local)}
                  change={delta(summary.local, previous!.local)}
                  icon={MapPin}
                  originScope="Município comprador"
                />
                <KpiCard
                  label="Evasão municipal"
                  value={percent(ratio(summary.external, summary.total))}
                  detail={compactMoney(summary.external)}
                  change={delta(summary.external, previous!.external)}
                  icon={ArrowUpRight}
                  originScope="Outros municípios + fora do CE"
                  inverse
                />
                <KpiCard
                  label="Origem não identificada"
                  value={percent(ratio(summary.unknown, summary.total))}
                  detail={compactMoney(summary.unknown)}
                  change={delta(summary.unknown, previous!.unknown)}
                  icon={HelpCircle}
                  originScope="Não identificada"
                  inverse
                />
              </div>

              {/* Charts Panel Section */}
              <div className="grid xl:grid-cols-2 gap-6 mb-6">
                <ChartPanel
                  title="Origem em relação ao comprador"
                  description="Porte: seleção global"
                  rows={summary.byOrigin.map((origin) => ({
                    label: origin.name,
                    values: [money(origin.value)],
                  }))}
                >
                  <DonutChart
                    data={summary.byOrigin}
                    total={summary.total}
                    onSelect={(origin) => setFilters({ origin })}
                  />
                </ChartPanel>

                <ChartPanel
                  title="Compras por UF do fornecedor"
                  description="Porte: seleção global"
                  legend={[{ label: 'Empenhado líquido', color: 'var(--chart-1)' }]}
                  rows={['CE', 'SP', '—'].map((uf) => ({
                    label: uf,
                    values: [
                      money(
                        destinations
                          .filter((dest) => dest.uf === uf)
                          .reduce((sum, dest) => sum + dest.total, 0)
                      ),
                    ],
                  }))}
                >
                  <BarsChart
                    data={['CE', 'SP', '—'].map((uf) => ({
                      name: uf === '—' ? 'Não ident.' : uf,
                      value: destinations
                        .filter((dest) => dest.uf === uf)
                        .reduce((sum, dest) => sum + dest.total, 0),
                    }))}
                    series={[{ key: 'value', label: 'Empenhado líquido', color: 'var(--chart-1)' }]}
                  />
                </ChartPanel>
              </div>
            </>
          ) : (
            <div className="panel p-6 mb-6 text-sm text-muted-foreground">
              Distribuições geográficas ocultas pelo filtro de origem.{' '}
              <Button variant="link" onClick={() => setFilters({ origin: 'all' })}>
                Ver todas as origens
              </Button>
            </div>
          )}

          {/* Table Section */}
          <DataTable
            rows={destinations}
            columns={columns}
            title="Destino por município do estabelecimento"
            searchPlaceholder="Buscar município ou UF..."
            initialSort="total"
          />
        </>
      )}
    </>
  );
}
