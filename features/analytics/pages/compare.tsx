'use client';

import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '../components/page-header';
import {
  GlobalFilters,
  MunicipalityPicker,
} from '../components/global-filters';
import { useAnalytics } from '../data/context';
import { aggregate, previousYear, selectExpenses } from '../data/repository';
import {
  compactMoney,
  percent,
  ratio,
  delta,
  points,
  money,
} from '@/shared/lib/format';
import { ChartPanel } from '@/shared/components/chart-panel';
import { TrendChart, BarsChart } from '../components/charts';
import { ExportButton } from '@/shared/components/export-button';
import { EmptyState } from '@/shared/components/states';
import { MUNICIPALITIES } from '../data/fixtures';

export default function Compare() {
  const { filters } = useAnalytics();
  const [mode, setMode] = useState('periods');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [cityA, setCityA] = useState('2300200');
  const [cityB, setCityB] = useState('2300754');

  const baseline = previousYear(filters);
  const af = {
    ...filters,
    municipality: mode === 'municipalities' ? cityA : filters.municipality,
  };
  const bf = {
    ...filters,
    municipality: mode === 'municipalities' ? cityB : filters.municipality,
    start: mode === 'periods' ? start || baseline.start : filters.start,
    end: mode === 'periods' ? end || baseline.end : filters.end,
  };

  const a = aggregate(selectExpenses(af));
  const b = aggregate(selectExpenses(bf));

  const aName =
    mode === 'periods'
      ? 'Período selecionado'
      : MUNICIPALITIES.find((m) => m.id === cityA)!.name;
  const bName =
    mode === 'periods'
      ? 'Período de comparação'
      : MUNICIPALITIES.find((m) => m.id === cityB)!.name;

  const metrics = [
    {
      label: 'Compras consideradas',
      a: a.total,
      b: b.total,
      percentage: false,
    },
    {
      label: 'Participação de ME',
      a: ratio(a.mpe, a.total),
      b: ratio(b.mpe, b.total),
      percentage: true,
    },
    {
      label: 'Participação MEI',
      a: ratio(a.mei, a.total),
      b: ratio(b.mei, b.total),
      percentage: true,
    },
    ...(filters.origin === 'all'
      ? [
          {
            label: 'Fornecedores locais',
            a: ratio(a.local, a.total),
            b: ratio(b.local, b.total),
            percentage: true,
          },
          {
            label: 'Evasão municipal',
            a: ratio(a.external, a.total),
            b: ratio(b.external, b.total),
            percentage: true,
          },
        ]
      : []),
  ];

  const series = [
    { key: 'a', label: aName, color: 'var(--chart-1)' },
    { key: 'b', label: bName, color: 'var(--chart-2)' },
  ];

  const timeline = Array.from(
    { length: Math.min(a.monthly.length, b.monthly.length) },
    (_, i) => ({
      date: new Date(2025, i, 15),
      label: `Mês ${i + 1} do intervalo`,
      a: a.monthly[i]?.total ?? 0,
      b: b.monthly[i]?.total ?? 0,
    })
  );

  return (
    <>
      <PageHeader
        eyebrow="Perspectiva comparativa"
        title="Comparar resultados"
        description="Identifique mudanças entre períodos ou compare dois municípios no mesmo recorte."
        actions={
          <ExportButton
            filters={filters}
            dataset={{
              title: 'Comparativo',
              columns: [
                'Indicador',
                `${aName} (${af.start} a ${af.end})`,
                `${bName} (${bf.start} a ${bf.end})`,
                'Variação',
              ],
              rows: metrics.map((m) => [
                m.label,
                m.percentage ? percent(m.a) : money(m.a),
                m.percentage ? percent(m.b) : money(m.b),
                m.percentage ? points(m.a - m.b) : percent(delta(m.a, m.b)),
              ]),
            }}
          />
        }
      />
      <GlobalFilters />
      <div className="panel mb-6 p-5">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList>
            <TabsTrigger value="periods">Entre períodos</TabsTrigger>
            <TabsTrigger value="municipalities">Entre municípios</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-5 flex flex-wrap items-end gap-4">
          {mode === 'periods' ? (
            <>
              <div className="flex-1">
                <p className="mb-2 text-xs text-muted-foreground">
                  Período A · filtros globais
                </p>
                <p className="text-sm font-medium">
                  {filters.start.split('-').reverse().join('/')} a{' '}
                  {filters.end.split('-').reverse().join('/')}
                </p>
              </div>
              <ArrowLeftRight className="mb-3 size-5 text-muted-foreground" />
              <div>
                <Label htmlFor="comparison-start" className="mb-2 text-xs">
                  Período B · início
                </Label>
                <Input
                  type="date"
                  id="comparison-start"
                  value={start || baseline.start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="comparison-end" className="mb-2 text-xs">
                  Período B · fim
                </Label>
                <Input
                  type="date"
                  id="comparison-end"
                  value={end || baseline.end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="filter-label">Município A</p>
                <MunicipalityPicker
                  value={cityA}
                  onChange={setCityA}
                  all={false}
                />
              </div>
              <ArrowLeftRight className="mb-3 size-5 text-muted-foreground" />
              <div>
                <p className="filter-label">Município B</p>
                <MunicipalityPicker
                  value={cityB}
                  onChange={setCityB}
                  all={false}
                />
              </div>
            </>
          )}
        </div>
        {bf.start > bf.end && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            O início da comparação deve ser anterior ao fim.
          </p>
        )}
      </div>
      {!a.count || !b.count ? (
        <EmptyState
          title="Um dos recortes não possui dados"
          description="Escolha dois períodos e municípios com dados para comparar."
        />
      ) : (
        <>
          <div className="panel mb-6 p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicador</TableHead>
                  <TableHead className="text-right text-primary">
                    {aName}
                  </TableHead>
                  <TableHead className="text-right">{bName}</TableHead>
                  <TableHead className="text-right">Variação A / B</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((m) => (
                  <TableRow key={m.label}>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    <TableCell className="data-value text-right">
                      {m.percentage ? percent(m.a) : compactMoney(m.a)}
                    </TableCell>
                    <TableCell className="data-value text-right text-muted-foreground">
                      {m.percentage ? percent(m.b) : compactMoney(m.b)}
                    </TableCell>
                    <TableCell className="data-value text-right text-primary">
                      {m.percentage
                        ? points(m.a - m.b)
                        : percent(delta(m.a, m.b))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-4 text-xs text-muted-foreground">
              Percentuais comparados em pontos percentuais. Valores monetários
              em variação percentual. Porte e origem seguem os mesmos filtros
              nos dois recortes.
            </p>
          </div>
          <ChartPanel
            title="Evolução comparada"
            description="Meses com dados alinhados pela posição; a curva usa apenas a quantidade comum de meses. Totais consideram o intervalo inteiro."
            legend={series.map((s) => ({ label: s.label, color: s.color }))}
            rows={timeline.map((t) => ({
              label: t.label,
              values: [money(t.a), money(t.b)],
            }))}
          >
            <TrendChart data={timeline} series={series} />
          </ChartPanel>
          <div className="mt-6">
            <ChartPanel
              title="Participação por porte"
              description="Percentual do valor considerado em cada recorte"
              legend={series.map((s) => ({ label: s.label, color: s.color }))}
              rows={a.bySize.map((s, i) => ({
                label: s.name,
                values: [
                  percent(ratio(s.value, a.total)),
                  percent(ratio(b.bySize[i].value, b.total)),
                ],
              }))}
            >
              <BarsChart
                percentage
                data={a.bySize.map((s, i) => ({
                  name: s.key === 'NI' ? 'Não ident.' : s.key,
                  a: ratio(s.value, a.total),
                  b: ratio(b.bySize[i].value, b.total),
                }))}
                series={series}
              />
            </ChartPanel>
          </div>
        </>
      )}
    </>
  );
}