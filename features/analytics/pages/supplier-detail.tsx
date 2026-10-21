'use client';

import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '../components/page-header';
import { GlobalFilters } from '../components/global-filters';
import { ExpenseTable } from '../components/expense-table';
import { TrendChart } from '../components/charts';
import { ChartPanel } from '@/shared/components/chart-panel';
import { ExportButton } from '@/shared/components/export-button';
import { EmptyState } from '@/shared/components/states';
import { useAnalytics } from '../data/context';
import { SUPPLIERS } from '../data/fixtures';
import { aggregate } from '../data/repository';
import { exportDataset } from '../data/export-datasets';
import { compactMoney, money, number } from '@/shared/lib/format';

export default function SupplierDetail({ id }: { id: string }) {
  const { data, navigate, filters } = useAnalytics();
  const s = SUPPLIERS.find((s) => s.id === id);

  if (!s) return <EmptyState title="Fornecedor não encontrado" />;

  const rows = data?.rows.filter((r) => r.supplier === id) ?? [];
  const summary = aggregate(rows);
  const series = [
    {
      key: 'total',
      label: 'Empenhado para o estabelecimento',
      color: 'var(--chart-1)',
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        className="mb-3 pl-0"
        onClick={() => navigate('/analitico/fornecedores')}
      >
        <ArrowLeft />
        Fornecedores
      </Button>
      <PageHeader
        eyebrow="Detalhe do estabelecimento"
        title={s.name}
        description={`CNPJ ilustrativo: ${s.cnpj}`}
        actions={
          data && (
            <ExportButton
              filters={filters}
              dataset={exportDataset({ ...data, rows }, 'despesas')}
            />
          )
        }
      />
      <GlobalFilters />
      <div className="mb-6 grid gap-6 xl:grid-cols-4">
        <section className="panel p-6 xl:col-span-2">
          <h2 className="mb-4 font-semibold">Informações cadastrais</h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {[
              [
                'Porte declarado',
                s.size === 'NI' ? 'Não identificado' : s.size,
              ],
              ['Município do estabelecimento', `${s.city} / ${s.uf}`],
              ['Código IBGE', s.ibge || 'Não identificado'],
              ['Natureza jurídica', s.nature],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <Badge variant="outline" className="mt-4">
            {s.status}
          </Badge>
        </section>
        <div className="panel p-6">
          <p className="text-sm text-muted-foreground">
            Valor considerado no recorte
          </p>
          <p className="metric mt-5 text-2xl">{compactMoney(summary.total)}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Porte: {s.size}
          </p>
        </div>
        <div className="panel p-6">
          <p className="text-sm text-muted-foreground">Empenhos no recorte</p>
          <p className="metric mt-5 text-2xl">{number(rows.length)}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {new Set(rows.map((r) => r.municipality)).size} município(s)
            comprador(es)
          </p>
        </div>
      </div>
      {rows.length ? (
        <>
          <ChartPanel
            className="analytics-fixed-chart"
            title="Evolução dos valores empenhados"
            description="Porte: declarado do fornecedor"
            legend={series.map((s) => ({ label: s.label, color: s.color }))}
            rows={summary.monthly.map((m) => ({
              label: m.label,
              values: [money(m.total)],
            }))}
          >
            <TrendChart data={summary.monthly} series={series} />
          </ChartPanel>
          <div className="mt-6">
            <ExpenseTable rows={rows} />
          </div>
        </>
      ) : (
        <EmptyState />
      )}
      <Alert className="mt-6">
        <Info className="size-4" />
        <AlertDescription>
          A situação cadastral é um retrato de referência e não comprova a
          situação na data da compra. A localização pertence ao estabelecimento,
          não necessariamente à matriz.
        </AlertDescription>
      </Alert>
    </>
  );
}
