'use client';

import { Database, MapPin, Building2, FileQuestion } from 'lucide-react';
import { PageHeader } from '../components/page-header';
import { GlobalFilters } from '../components/global-filters';
import { useAnalytics } from '../data/context';
import { KpiCard } from '@/shared/components/kpi-card';
import { DataTable, type Column } from '@/shared/components/data-table';
import { Badge } from '@/components/ui/badge';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/shared/components/states';
import { number, percent, ratio, dateLabel } from '@/shared/lib/format';

export default function Quality() {
  const { data, state, filters, reload } = useAnalytics();
  const a = data?.summary;

  const rows =
    data?.municipalities
      .filter(
        (m) =>
          filters.municipality === 'all' || m.id === filters.municipality
      )
      .map((m) => ({
        id: m.id,
        name: m.name,
        count: m.count,
        unknown: ratio(
          m.bySize.find((s) => s.key === 'NI')!.value,
          m.total
        ),
        status: m.count ? 'Disponível' : 'Sem dados',
        updated: m.count ? '2026-09-10' : '—',
      })) ?? [];

  type Row = (typeof rows)[number];

  const columns: Column<Row>[] = [
    { key: 'name', label: 'Município', get: (r) => r.name },
    {
      key: 'count',
      label: 'Empenhos no recorte',
      get: (r) => r.count,
      align: 'right',
    },
    {
      key: 'unknown',
      label: 'Porte não identificado',
      get: (r) => r.unknown,
      render: (r) => (r.count ? percent(r.unknown) : '—'),
      align: 'right',
    },
    {
      key: 'updated',
      label: 'Atualização ilustrativa',
      get: (r) => r.updated,
      render: (r) => (r.updated === '—' ? '—' : dateLabel(r.updated)),
    },
    {
      key: 'status',
      label: 'Cobertura',
      get: (r) => r.status,
      render: (r) => <Badge variant="outline">{r.status}</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Procedência e cobertura"
        title="Qualidade da base"
        description="Consulte a cobertura do recorte e identifique informações ainda não classificadas."
      />
      <GlobalFilters />
      {state === 'loading' ? (
        <LoadingState />
      ) : state === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : !a ? (
        <EmptyState />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Municípios com dados"
              value={`${rows.filter((r) => r.count).length} / ${rows.length}`}
              detail="Amostra de demonstração"
              change={null}
              icon={MapPin}
            />
            <KpiCard
              label="Registros no recorte"
              value={number(a.count)}
              detail="Notas de empenho consideradas"
              change={null}
              icon={Database}
            />
            <KpiCard
              label="Porte não identificado"
              value={percent(
                ratio(a.bySize.find((s) => s.key === 'NI')!.value, a.total)
              )}
              detail="Participação no valor considerado"
              change={null}
              icon={Building2}
            />
            {filters.origin === 'all' && (
              <KpiCard
                label="Origem não identificada"
                value={percent(ratio(a.unknown, a.total))}
                detail="Participação no valor considerado"
                change={null}
                icon={FileQuestion}
              />
            )}
          </div>
          <DataTable
            rows={rows}
            columns={columns}
            title="Cobertura por município"
            searchPlaceholder="Buscar município..."
          />
          <div className="panel mt-6 p-6">
            <h2 className="font-semibold">Referência da demonstração</h2>
            <div className="mt-4 grid gap-6 text-sm md:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Última carga ilustrativa</p>
                <p className="mt-1 font-medium">10/09/2026</p>
              </div>
              <div>
                <p className="text-muted-foreground">Período disponível</p>
                <p className="mt-1 font-medium">Janeiro/2024 a agosto/2026</p>
              </div>
              <div>
                <p className="text-muted-foreground">Origem prevista</p>
                <p className="mt-1 font-medium">SIM/TCE-CE + Receita + IBGE</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Ausência de dados não significa ausência de compras. Em produção,
              a última carga válida deve permanecer disponível quando houver
              falhas de atualização.
            </p>
          </div>
        </>
      )}
    </>
  );
}