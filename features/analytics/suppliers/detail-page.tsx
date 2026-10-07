'use client';

import axios from 'axios';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, CircleAlert, DatabaseZap } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieCenter } from '@/components/charts/pie-center';
import { PieChart } from '@/components/charts/pie-chart';
import { PieSlice } from '@/components/charts/pie-slice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { compactMoney, money, number, percent } from '@/shared/lib/format';
import { AnalyticsApiError } from '../commitments/api';
import { companySizeLabel, formatCivilDate, formatCompetence, formatTimestamp, nullableLabel, supplierOriginLabel } from '../commitments/detail-format';
import { getCommitmentErrorContent } from '../commitments/error-state';
import { fetchSupplierDetail } from './api';
import { booleanLabel, fillMissingMonths } from './detail';
import { formatSupplierDocument } from './navigation';
import { parseSupplierDetailFilters, serializeSupplierDetailFilters } from './query';
import type { SupplierDetail, SupplierDetailFilters, SupplierExpenseElement, SupplierRegistryAvailable } from './types';

type RequestState = { key: string; data: SupplierDetail | null; error: AnalyticsApiError | null };

const EXPENSE_ELEMENT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--primary)',
  'var(--muted-foreground)',
] as const;

export function SupplierDetailView({ type, document }: { type: 'CNPJ' | 'CPF'; document: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.toString();
  const filters = useMemo(
    () => parseSupplierDetailFilters(new URLSearchParams(rawQuery)),
    [rawQuery],
  );
  const filterQuery = filters ? serializeSupplierDetailFilters(filters).toString() : '';
  const [version, setVersion] = useState(0);
  const requestKey = filters ? `${type}:${document}:${filterQuery}:${version}` : '';
  const [state, setState] = useState<RequestState>({ key: '', data: null, error: null });

  useEffect(() => {
    if (!filters) return;
    const controller = new AbortController();
    fetchSupplierDetail(type, document, filters, controller.signal)
      .then((data) => setState({ key: requestKey, data, error: null }))
      .catch((error: unknown) => {
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          setState({
            key: requestKey,
            data: null,
            error: error instanceof AnalyticsApiError
              ? error
              : new AnalyticsApiError(500, 'Erro inesperado.'),
          });
        }
      });
    return () => controller.abort();
    // requestKey is the normalized identity, including manual retries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  function updatePeriod(name: 'start_date' | 'end_date', value: string) {
    const next = new URLSearchParams(rawQuery);
    if (value) next.set(name, value); else next.delete(name);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  const listHref = rawQuery ? `/analitico/fornecedores?${rawQuery}` : '/analitico/fornecedores';
  if (!filters) {
    return <div>
      <BackLink href={listHref} />
      <PeriodRequired
        startDate={searchParams.get('start_date') ?? ''}
        endDate={searchParams.get('end_date') ?? ''}
        onChange={updatePeriod}
      />
    </div>;
  }

  const loading = state.key !== requestKey;
  return <div>
    <BackLink href={listHref} />
    {loading && !state.data ? <DetailSkeleton /> : state.error && !loading
      ? <DetailError error={state.error} listHref={listHref} onRetry={() => setVersion((value) => value + 1)} />
      : state.data ? <div aria-busy={loading}>
          {loading && <div role="status" className="mb-3 rounded-md border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">Atualizando o recorte…</div>}
          <DetailContent detail={state.data} filters={filters} />
        </div>
      : null}
  </div>;
}

function BackLink({ href }: { href: string }) {
  return <Button asChild variant="ghost" className="mb-5 pl-0"><Link href={href}><ArrowLeft />Voltar aos fornecedores</Link></Button>;
}

function PeriodRequired({ startDate, endDate, onChange }: {
  startDate: string;
  endDate: string;
  onChange: (name: 'start_date' | 'end_date', value: string) => void;
}) {
  return <section className="panel mx-auto max-w-2xl p-6 sm:p-8" aria-labelledby="period-title">
    <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><CalendarDays /></div>
    <h1 id="period-title" className="mt-5 text-2xl font-semibold">Selecione o período da consulta</h1>
    <p className="mt-2 text-sm text-muted-foreground">O detalhe só é consultado quando as datas inicial e final estão definidas.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div><Label htmlFor="detail-start" className="filter-label">Data inicial</Label><Input id="detail-start" type="date" value={startDate} onChange={(event) => onChange('start_date', event.target.value)} /></div>
      <div><Label htmlFor="detail-end" className="filter-label">Data final</Label><Input id="detail-end" type="date" value={endDate} onChange={(event) => onChange('end_date', event.target.value)} /></div>
    </div>
  </section>;
}

function DetailSkeleton() {
  return <div aria-busy="true" aria-label="Carregando fornecedor" className="space-y-5"><Skeleton className="h-40 rounded-lg" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-28 rounded-lg" />)}</div><Skeleton className="h-80 rounded-lg" /></div>;
}

function DetailError({ error, listHref, onRetry }: { error: AnalyticsApiError; listHref: string; onRetry: () => void }) {
  if (error.status === 404 || (error.status === 422 && error.code === 'INVALID_SUPPLIER_DOCUMENT')) {
    return <Alert role="alert" className="panel p-6"><CircleAlert /><AlertTitle>Fornecedor não encontrado no recorte</AlertTitle><AlertDescription><p>Confira o documento ou retorne para consultar outro fornecedor.</p><Button asChild variant="outline" className="mt-3"><Link href={listHref}>Voltar para a lista</Link></Button>{error.requestId && <SupportCode value={error.requestId} />}</AlertDescription></Alert>;
  }
  const content = getCommitmentErrorContent(error.status, error.message);
  const errorContent = error.status === 403
    ? {
        ...content,
        title: 'Cadastro necessário',
        description: 'Conclua seu cadastro para acessar os dados analíticos.',
        action: 'Completar cadastro',
      }
    : content;
  const returnTo = typeof window === 'undefined' ? '' : `${window.location.pathname}${window.location.search}`;
  const href = error.status === 401 ? `/login?returnTo=${encodeURIComponent(returnTo)}` : error.status === 403 ? `/request-access/company?returnTo=${encodeURIComponent(returnTo)}` : errorContent.href;
  return <Alert role="alert" variant="destructive" className="panel p-6"><CircleAlert /><AlertTitle>{errorContent.title}</AlertTitle><AlertDescription><p>{errorContent.description}</p>{href ? <Button asChild variant="outline" className="mt-3"><Link href={href}>{errorContent.action}</Link></Button> : <Button variant="outline" className="mt-3" onClick={onRetry}>{errorContent.action}</Button>}{error.requestId && <SupportCode value={error.requestId} />}</AlertDescription></Alert>;
}

function SupportCode({ value }: { value: string }) {
  return <p className="mt-3 font-mono text-xs text-muted-foreground">Código de suporte: {value}</p>;
}

function DetailContent({ detail, filters }: { detail: SupplierDetail; filters: SupplierDetailFilters }) {
  const { fornecedor, recorte } = detail;
  const months = fillMissingMonths(recorte.start_date, recorte.end_date, detail.evolucao_mensal);
  const missingMonths = months.filter((item) => item.semMovimento);
  const positiveElements = detail.por_elemento_despesa.filter((item) => item.valor_considerado_centavos > 0);
  const commitmentsParams = serializeSupplierDetailFilters(filters);
  const commitmentsHref = `/analytics/fornecedores/${encodeURIComponent(fornecedor.tipo_documento)}/${encodeURIComponent(fornecedor.documento)}/empenhos?${commitmentsParams}`;
  const municipality = recorte.municipality_tce_code ? `Município TCE ${recorte.municipality_tce_code}` : 'Todos os municípios';

  return <div className="space-y-6">
    <header className="panel overflow-hidden">
      <div className="border-b bg-linear-to-r from-primary/10 via-card to-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0"><p className="eyebrow text-primary">Detalhe do fornecedor</p><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{fornecedor.nome}</h1><p className="mt-2 font-mono text-sm text-muted-foreground">{formatSupplierDocument(fornecedor)}</p></div>
          <Button asChild><Link href={commitmentsHref}>Ver {number(detail.empenhos.total_items)} empenhos <ArrowUpRight /></Link></Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2"><Badge variant="secondary">{companySizeLabel(fornecedor.porte)}</Badge>{fornecedor.origens_no_recorte.map((origin) => <Badge key={origin} variant="outline">{supplierOriginLabel(origin)}</Badge>)}</div>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-2 px-6 py-4 text-sm text-muted-foreground sm:px-8"><span>{formatCivilDate(recorte.start_date)} a {formatCivilDate(recorte.end_date)}</span><span>{municipality}</span></div>
    </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do recorte">
      <Kpi label="Valor empenhado" value={money(recorte.valor_empenhado_centavos)} />
      <Kpi label="Valor anulado" value={money(recorte.valor_anulado_centavos)} />
      <Kpi label="Valor considerado" value={money(recorte.valor_considerado_centavos)} prominent />
      <Kpi label="Valor médio por empenho" value={money(recorte.valor_medio_por_empenho_centavos)} />
      <Kpi label="Empenhos" value={number(recorte.quantidade_empenhos)} detail={`${number(recorte.quantidade_anulacoes)} anulações`} />
      <Kpi label="Percentual anulado" value={percent(recorte.percentual_anulado)} />
      <Kpi label="Contratos" value={number(recorte.quantidade_contratos)} />
      <Kpi label="Licitações" value={number(recorte.quantidade_licitacoes)} />
      <Kpi label="Municípios" value={number(recorte.quantidade_municipios)} />
      <Kpi label="Primeiro empenho" value={recorte.primeiro_empenho ? formatCivilDate(recorte.primeiro_empenho) : '—'} />
      <Kpi label="Último empenho" value={recorte.ultimo_empenho ? formatCivilDate(recorte.ultimo_empenho) : '—'} />
      <Kpi label="Meses com movimento" value={number(recorte.meses_com_movimento)} />
    </section>

    <section className="panel p-6" aria-labelledby="share-title"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-primary">Participação no recorte</p><h2 id="share-title" className="mt-2 text-xl font-semibold">{percent(detail.participacao_no_recorte.percentual)} do valor total</h2></div><p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{money(detail.participacao_no_recorte.valor_fornecedor_centavos)}</span> de {money(detail.participacao_no_recorte.valor_total_recorte_centavos)}</p></div><Progress className="mt-5 h-3" value={Math.min(100, Math.max(0, detail.participacao_no_recorte.percentual))} aria-label="Participação percentual do fornecedor" /></section>

    <section className="panel p-6" aria-labelledby="evolution-title"><h2 id="evolution-title" className="text-lg font-semibold">Evolução mensal</h2><p className="mt-1 text-sm text-muted-foreground">Valores informados pela API; lacunas do período aparecem zeradas apenas neste gráfico.</p><ChartContainer className="mt-6 h-80 w-full aspect-auto" config={{ considerado: { label: 'Valor considerado', color: 'var(--chart-1)' }, anulado: { label: 'Valor anulado', color: 'var(--chart-3)' } }}><AreaChart data={months} accessibilityLayer><defs><linearGradient id="supplier-net" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-considerado)" stopOpacity={0.35}/><stop offset="95%" stopColor="var(--color-considerado)" stopOpacity={0.03}/></linearGradient></defs><CartesianGrid vertical={false} /><XAxis dataKey="competencia" tickFormatter={formatCompetence} tickLine={false} axisLine={false} minTickGap={24} /><YAxis tickFormatter={(value) => `R$ ${new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(Number(value) / 100)}`} tickLine={false} axisLine={false} width={72} /><ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => formatCompetence(String(value))} formatter={(value, name, item) => <div className="flex min-w-48 justify-between gap-4"><span>{item.payload.semMovimento ? 'Sem movimento' : name === 'valor_anulado_centavos' ? 'Valor anulado' : 'Valor considerado'}</span><span className="font-mono font-medium">{money(Number(value))}</span></div>} />} /><Area type="monotone" dataKey="valor_considerado_centavos" name="valor_considerado_centavos" stroke="var(--color-considerado)" fill="url(#supplier-net)" strokeWidth={2} /><Area type="monotone" dataKey="valor_anulado_centavos" name="valor_anulado_centavos" stroke="var(--color-anulado)" fill="transparent" strokeDasharray="5 4" strokeWidth={2} /></AreaChart></ChartContainer>{missingMonths.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>Sem movimento:</span>{missingMonths.map((item) => <Badge key={item.competencia} variant="outline" className="font-normal">{formatCompetence(item.competencia)}</Badge>)}</div>}</section>

    <section className="panel p-6" aria-labelledby="elements-title"><h2 id="elements-title" className="text-lg font-semibold">Elementos de despesa</h2><p className="mt-1 text-sm text-muted-foreground">Distribuição do valor considerado com movimento.</p>{positiveElements.length > 0 ? <ExpenseElementsPie elements={detail.por_elemento_despesa} /> : <p className="mt-8 text-sm text-muted-foreground">Nenhum elemento com valor positivo.</p>}</section>
    <RegistryCard registry={fornecedor.cadastro} />
  </div>;
}

function Kpi({ label, value, detail, prominent = false }: { label: string; value: string; detail?: string; prominent?: boolean }) {
  return <div className={`panel p-5 ${prominent ? 'border-primary/40 bg-primary/5' : ''}`}><p className="text-sm text-muted-foreground">{label}</p><p className="metric mt-3 text-xl">{value}</p>{detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}</div>;
}

function ExpenseElementsPie({ elements }: { elements: SupplierExpenseElement[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartData = useMemo(() => elements.map((item, index) => ({
    label: `${item.codigo} · ${item.nome}`,
    value: item.valor_considerado_centavos,
    color: EXPENSE_ELEMENT_COLORS[index % EXPENSE_ELEMENT_COLORS.length],
  })), [elements]);

  return <div className="mt-5 grid items-center gap-6 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)]">
    <div className="mx-auto size-56 shrink-0">
      <PieChart
        data={chartData}
        innerRadius={72}
        padAngle={0.025}
        cornerRadius={3}
        hoveredIndex={hoveredIndex}
        onHoverChange={setHoveredIndex}
        enterStaggerScale={0.8}
      >
        <PieCenter>
          {({ value, label, isHovered }) => <div className="px-4 text-center">
            <p className="metric whitespace-nowrap text-[clamp(1rem,8cqw,0.875rem)] leading-none text-primary">{isHovered ? compactMoney(value) : '7 elementos'}</p>
            <p className="mt-1 line-clamp-2 text-[0.6875rem] leading-tight text-muted-foreground">{isHovered ? label : 'valor considerado'}</p>
          </div>}
        </PieCenter>
        {chartData.map((item, index) => <PieSlice key={item.label} index={index} showGlow={false} hoverEffect="grow" />)}
      </PieChart>
    </div>

    <div className="grid gap-0" aria-label="Legenda dos sete elementos de despesa">
      {elements.map((item, index) => {
        const active = hoveredIndex === index;
        return <Button
          key={item.codigo}
          type="button"
          variant="ghost"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onFocus={() => setHoveredIndex(index)}
          onBlur={() => setHoveredIndex(null)}
          className={`h-auto min-h-9! w-full justify-between gap-3 px-1.5 py-1 text-left font-normal transition-colors ${active ? 'bg-muted text-foreground' : ''}`}
          aria-label={`${item.codigo} ${item.nome}: ${percent(item.percentual)}, ${money(item.valor_considerado_centavos)}`}
        >
          <span className="flex min-w-0 items-start gap-2">
            <span className="mt-1 size-2 shrink-0 rounded-sm" style={{ backgroundColor: EXPENSE_ELEMENT_COLORS[index % EXPENSE_ELEMENT_COLORS.length] }} aria-hidden="true" />
            <span className="whitespace-normal text-xs leading-tight"><span className="font-mono text-[0.6875rem]">{item.codigo}</span> · {item.nome}</span>
          </span>
          <span className="shrink-0 text-right"><span className="data-value block text-xs">{percent(item.percentual)}</span><span className="block text-[0.6875rem] text-muted-foreground">{money(item.valor_considerado_centavos)}</span></span>
        </Button>;
      })}
    </div>
  </div>;
}

function RegistryCard({ registry }: { registry: SupplierDetail['fornecedor']['cadastro'] }) {
  if (registry.status === 'NAO_DISPONIVEL') return <section className="panel p-6" aria-labelledby="registry-title"><div className="flex items-start gap-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><DatabaseZap /></div><div><h2 id="registry-title" className="text-lg font-semibold">Dados cadastrais não disponíveis</h2><p className="mt-1 text-sm text-muted-foreground">Os indicadores do recorte continuam disponíveis normalmente.</p></div></div></section>;
  return <AvailableRegistry registry={registry} />;
}

function AvailableRegistry({ registry }: { registry: SupplierRegistryAvailable }) {
  const cnae = registry.cnae_principal ? [registry.cnae_principal.codigo, registry.cnae_principal.descricao].filter(Boolean).join(' · ') : '—';
  const facts: Array<[string, string]> = [
    ['Razão social', nullableLabel(registry.razao_social)], ['Nome fantasia', nullableLabel(registry.nome_fantasia)],
    ['Situação cadastral', nullableLabel(registry.situacao_cadastral)], ['Matriz / filial', nullableLabel(registry.matriz_filial)],
    ['Início de atividade', registry.data_inicio_atividade ? formatCivilDate(registry.data_inicio_atividade) : '—'],
    ['Capital social', registry.capital_social_centavos === null ? '—' : money(registry.capital_social_centavos)],
    ['Natureza jurídica', nullableLabel(registry.natureza_juridica)], ['Simples Nacional', booleanLabel(registry.simples_nacional)],
    ['MEI', booleanLabel(registry.mei)], ['Sede', [registry.municipio_sede, registry.uf_sede].filter(Boolean).join(' / ') || '—'],
    ['CNAE principal', cnae], ['Observado em', formatTimestamp(registry.observado_em)],
  ];
  return <section className="panel p-6" aria-labelledby="registry-title"><div className="flex flex-wrap items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 /></div><div><p className="eyebrow text-primary">Registro empresarial</p><h2 id="registry-title" className="mt-1 text-lg font-semibold">Dados cadastrais</h2></div>{registry.desatualizado && <Badge variant="outline" className="ml-auto text-warning">Cadastro desatualizado</Badge>}</div><dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">{facts.map(([label, value]) => <div key={label} className="border-l-2 border-border pl-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>)}</dl><Alert className="mt-6 bg-muted/30"><AlertDescription>Cadastro mais recente armazenado, pode diferir da situação no período consultado.</AlertDescription></Alert></section>;
}
