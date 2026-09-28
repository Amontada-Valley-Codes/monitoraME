'use client';

import { ArrowLeft, ArrowUpRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '../components/page-header';
import { useAnalytics } from '../data/context';
import {
  EXPENSES,
  MUNICIPALITIES,
  SUPPLIERS,
  CATEGORIES,
  ORIGINS,
  SIZES,
} from '../data/fixtures';
import { EmptyState } from '@/shared/components/states';
import { money, dateLabel } from '@/shared/lib/format';
import { ExportButton } from '@/shared/components/export-button';

export default function ExpenseDetail({ id }: { id: string }) {
  const { navigate, filters } = useAnalytics();
  const row = EXPENSES.find((e) => e.id === id);

  if (!row) return <EmptyState title="Empenho não encontrado" />;

  const municipality = MUNICIPALITIES.find((m) => m.id === row.municipality)!;
  const supplier = SUPPLIERS.find((s) => s.id === row.supplier)!;

  const facts = [
    ['Data do empenho', dateLabel(row.date)],
    [
      'Elemento de despesa',
      `${row.category} · ${CATEGORIES.find((c) => c.id === row.category)?.name}`,
    ],
    [
      'Porte',
      SIZES.find((s) => s.id === row.size)?.name ?? 'Não identificado',
    ],
    [
      'Origem',
      ORIGINS.find((o) => o.id === row.origin)?.name ?? 'Não identificada',
    ],
    [
      'Procedência do porte',
      row.provenance === 'HISTORICO'
        ? 'Histórico simulado'
        : 'Retrato cadastral atual',
    ],
    [
      'MEI discriminado',
      row.meiDiscriminated
        ? 'Sim · informação do Simples'
        : 'Não · Microempresa inclui MEI',
    ],
  ];

  return (
    <>
      <Button
        variant="ghost"
        className="mb-3 pl-0"
        onClick={() => navigate('/analitico/despesas')}
      >
        <ArrowLeft />
        Despesas
      </Button>
      <PageHeader
        eyebrow="Detalhe do registro"
        title={row.id}
        description={`${municipality.name} / CE · ${dateLabel(row.date)}`}
        actions={
          <ExportButton
            filters={{
              ...filters,
              start: row.date,
              end: row.date,
              municipality: row.municipality,
              size: row.size,
              origin: row.origin,
              categories: [row.category],
            }}
            dataset={{
              title: 'Detalhe do empenho',
              columns: ['Campo', 'Valor'],
              rows: [
                ['Empenho', row.id],
                ...facts,
                ['Valor bruto (R$)', row.gross / 100],
                ['Anulações (R$)', row.cancelled / 100],
                ['Valor líquido (R$)', row.net / 100],
              ],
            }}
          />
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          ['Valor bruto', row.gross],
          ['Anulações', row.cancelled],
          ['Empenhado líquido', row.net],
        ].map(([label, v]) => (
          <div className="panel p-6" key={label}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="metric mt-3 text-xl">{money(Number(v))}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="panel p-6 xl:col-span-2">
          <h2 className="mb-5 font-semibold">Informações do empenho</h2>
          <dl className="grid gap-6 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 border-t pt-5">
            <h3 className="text-sm font-semibold">Descrição</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {row.description}
            </p>
          </div>
        </section>
        <section className="panel p-6">
          <h2 className="mb-4 font-semibold">Estabelecimento fornecedor</h2>
          <p className="font-medium">{supplier.name}</p>
          <p className="data-value mt-3 text-xs">{supplier.cnpj}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {supplier.city} · {supplier.uf}
          </p>
          <Badge variant="outline" className="mt-3">
            {supplier.status}
          </Badge>
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => navigate('/analitico/fornecedores/' + supplier.id)}
          >
            Ver fornecedor
            <ArrowUpRight className="size-4" />
          </Button>
        </section>
      </div>
      <Alert className="mt-6">
        <Info className="size-4" />
        <AlertDescription>
          Registro fictício para demonstração. O empenho representa compromisso
          orçamentário, sem comprovar entrega, liquidação ou pagamento.
        </AlertDescription>
      </Alert>
    </>
  );
}
