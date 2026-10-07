'use client';

import axios from 'axios';
import { ArrowLeft, ChevronLeft, ChevronRight, CircleAlert, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/shared/components/select-field';
import { EmptyState, LoadingState } from '@/shared/components/states';
import { number } from '@/shared/lib/format';
import { AnalyticsApiError } from '../commitments/api';
import { formatCivilDate } from '../commitments/detail-format';
import { getCommitmentErrorContent, getCommitmentViewState } from '../commitments/error-state';
import { buildCommitmentDetailHref } from '../commitments/navigation';
import { CommitmentTable } from '../commitments/table';
import type { CommitmentSortField } from '../commitments/types';
import { fetchSupplierCommitments } from './commitments-api';
import { nextSupplierCommitmentSort, parseSupplierCommitmentFilters, patchSupplierCommitmentFilters, serializeSupplierCommitmentFilters } from './commitments-query';
import type { SupplierCommitmentFilters, SupplierCommitmentsResponse } from './commitments-types';
import { formatSupplierDocument } from './navigation';
import { serializeSupplierDetailFilters } from './query';

type State = { key: string; data: SupplierCommitmentsResponse | null; error: AnalyticsApiError | null };

export function SupplierCommitmentsView({ type, document }: { type: 'CNPJ' | 'CPF'; document: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.toString();
  const filters = useMemo(() => parseSupplierCommitmentFilters(new URLSearchParams(rawQuery)), [rawQuery]);
  const queryString = filters ? serializeSupplierCommitmentFilters(filters).toString() : '';
  const [version, setVersion] = useState(0);
  const requestKey = filters ? `${type}:${document}:${queryString}:${version}` : '';
  const [state, setState] = useState<State>({ key: '', data: null, error: null });

  const replaceFilters = useCallback((next: SupplierCommitmentFilters) => {
    router.replace(`${pathname}?${serializeSupplierCommitmentFilters(next)}`, { scroll: false });
  }, [pathname, router]);
  const updateFilters = useCallback((patch: Partial<SupplierCommitmentFilters>, resetPage = true) => {
    if (filters) replaceFilters(patchSupplierCommitmentFilters(filters, patch, resetPage));
  }, [filters, replaceFilters]);

  useEffect(() => {
    if (!filters || rawQuery === queryString) return;
    replaceFilters(filters);
  }, [filters, queryString, rawQuery, replaceFilters]);
  useEffect(() => {
    if (!filters) return;
    const controller = new AbortController();
    fetchSupplierCommitments(type, document, filters, controller.signal)
      .then((data) => setState({ key: requestKey, data, error: null }))
      .catch((error: unknown) => {
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          setState({ key: requestKey, data: null, error: error instanceof AnalyticsApiError ? error : new AnalyticsApiError(500, 'Erro inesperado.') });
        }
      });
    return () => controller.abort();
    // requestKey contains every API parameter and the manual retry version.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const loading = Boolean(filters) && state.key !== requestKey;
  const data = state.data;
  const error = loading ? null : state.error;
  useEffect(() => {
    if (!loading && data && filters && filters.page > Math.max(1, data.pagination.total_pages)) updateFilters({ page: 1 }, false);
  }, [data, filters, loading, updateFilters]);

  if (!filters) return <PeriodRequired rawQuery={rawQuery} pathname={pathname} />;

  const detailParams = serializeSupplierDetailFilters(filters);
  const detailHref = `/analytics/fornecedores/${encodeURIComponent(type)}/${encodeURIComponent(document)}?${detailParams}`;
  const openCommitment = (key: string) => router.push(buildCommitmentDetailHref(key, `${pathname}?${queryString}`));
  const resetFilters = () => replaceFilters({
    start_date: filters.start_date,
    end_date: filters.end_date,
    ...(filters.uf ? { uf: filters.uf } : {}),
    company_sizes: [], supplier_origins: [], expense_element_codes: [],
    page: 1, page_size: 50, sort_by: 'net_value', sort_order: 'desc',
  });
  const viewState = getCommitmentViewState(loading && !data, Boolean(error), data?.items.length ?? 0);
  const firstItem = data?.pagination.total_items ? (data.pagination.page - 1) * data.pagination.page_size + 1 : 0;
  const lastItem = data ? Math.min(data.pagination.page * data.pagination.page_size, data.pagination.total_items) : 0;

  return <div>
    <Button asChild variant="ghost" className="mb-5 pl-0"><Link href={detailHref}><ArrowLeft />Voltar ao fornecedor</Link></Button>
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-primary">Empenhos do fornecedor</p><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{data?.fornecedor.nome ?? 'Fornecedor'}</h1><p className="mt-2 font-mono text-sm text-muted-foreground">{formatSupplierDocument({ tipo_documento: type, documento: data?.fornecedor.documento ?? document })}</p></div>{data && <Badge variant="secondary">{number(data.pagination.total_items)} empenhos</Badge>}</header>

    <section className="panel no-print mb-6 p-4" aria-label="Filtros dos empenhos do fornecedor">
      <div className="mb-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground"><span>{formatCivilDate(filters.start_date)} a {formatCivilDate(filters.end_date)}</span><span>{filters.municipality_tce_code ? `Município TCE ${filters.municipality_tce_code}` : 'Todos os municípios'}</span></div>
      <div className="flex flex-col gap-3 sm:flex-row"><CommitmentSearch currentValue={filters.search ?? ''} onSearch={(search) => updateFilters({ search: search || undefined })} /><div className="flex items-center gap-2"><Label className="whitespace-nowrap text-sm text-muted-foreground">Itens por página</Label><SelectField label="Itens por página" value={String(filters.page_size)} onChange={(value) => updateFilters({ page_size: Number(value) })} options={[20, 50, 100].map((value) => ({ value: String(value), label: String(value) }))} className="w-20" /></div></div>
    </section>

    {loading && data && <div role="status" className="mb-3 rounded-md border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">Atualizando empenhos…</div>}
    {viewState === 'loading' ? <LoadingState /> : viewState === 'error' && error ? <CommitmentsError error={error} detailHref={detailHref} onRetry={() => setVersion((value) => value + 1)} /> : viewState === 'empty' ? <EmptyState title="Nenhum empenho neste recorte" description="Ajuste a busca ou limpe os filtros para consultar outros registros." onReset={resetFilters} /> : data && <section className="panel overflow-hidden" aria-label="Lista de empenhos do fornecedor" aria-busy={loading}>
      <CommitmentTable items={data.items} sortBy={filters.sort_by} sortOrder={filters.sort_order} omitSupplier onSort={(field: CommitmentSortField) => updateFilters(nextSupplierCommitmentSort(filters, field))} onOpen={openCommitment} />
      <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row"><p className="text-sm text-muted-foreground" aria-live="polite">{number(firstItem)}–{number(lastItem)} de {number(data.pagination.total_items)}</p><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Página {number(data.pagination.page)} de {number(Math.max(1, data.pagination.total_pages))}</span><Button variant="outline" size="icon" aria-label="Página anterior" disabled={!data.pagination.has_previous || loading} onClick={() => updateFilters({ page: filters.page - 1 }, false)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label="Próxima página" disabled={!data.pagination.has_next || loading} onClick={() => updateFilters({ page: filters.page + 1 }, false)}><ChevronRight /></Button></div></div>
    </section>}
  </div>;
}

function CommitmentSearch({ currentValue, onSearch }: { currentValue: string; onSearch: (value: string) => void }) {
  const [value, setValue] = useState(currentValue);
  useEffect(() => {
    const normalized = value.trim().slice(0, 200);
    if (normalized === currentValue) return;
    const timer = window.setTimeout(() => onSearch(normalized), 400);
    return () => window.clearTimeout(timer);
  }, [currentValue, onSearch, value]);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSearch(value.trim().slice(0, 200)); }
  return <form className="flex min-w-0 flex-1 gap-2" onSubmit={submit}><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Buscar empenho" className="pl-9" value={value} maxLength={200} placeholder="Número do empenho ou identificador" onChange={(event) => setValue(event.target.value)} /></div><Button type="submit">Buscar</Button></form>;
}

function PeriodRequired({ rawQuery, pathname }: { rawQuery: string; pathname: string }) {
  const router = useRouter();
  function update(name: 'start_date' | 'end_date', value: string) { const next = new URLSearchParams(rawQuery); if (value) next.set(name, value); else next.delete(name); router.replace(`${pathname}?${next}`, { scroll: false }); }
  const params = new URLSearchParams(rawQuery);
  return <section className="panel mx-auto max-w-2xl p-6 sm:p-8"><h1 className="text-2xl font-semibold">Selecione o período da consulta</h1><p className="mt-2 text-sm text-muted-foreground">As duas datas são necessárias para consultar os empenhos.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div><Label htmlFor="supplier-commitments-start" className="filter-label">Data inicial</Label><Input id="supplier-commitments-start" type="date" value={params.get('start_date') ?? ''} onChange={(event) => update('start_date', event.target.value)} /></div><div><Label htmlFor="supplier-commitments-end" className="filter-label">Data final</Label><Input id="supplier-commitments-end" type="date" value={params.get('end_date') ?? ''} onChange={(event) => update('end_date', event.target.value)} /></div></div></section>;
}

function CommitmentsError({ error, detailHref, onRetry }: { error: AnalyticsApiError; detailHref: string; onRetry: () => void }) {
  if (error.status === 404) return <Alert role="alert" className="panel p-6"><CircleAlert /><AlertTitle>Fornecedor não encontrado no recorte</AlertTitle><AlertDescription><Button asChild variant="outline" className="mt-3"><Link href={detailHref}>Voltar ao fornecedor</Link></Button>{error.requestId && <SupportCode value={error.requestId} />}</AlertDescription></Alert>;
  const content = getCommitmentErrorContent(error.status, error.message);
  const returnTo = typeof window === 'undefined' ? '' : `${window.location.pathname}${window.location.search}`;
  const href = error.status === 401 ? `/login?returnTo=${encodeURIComponent(returnTo)}` : error.status === 403 ? `/request-access/company?returnTo=${encodeURIComponent(returnTo)}` : content.href;
  return <Alert role="alert" variant="destructive" className="panel p-6"><CircleAlert /><AlertTitle>{content.title}</AlertTitle><AlertDescription><p>{error.status === 403 ? 'Conclua seu cadastro para acessar os dados analíticos.' : content.description}</p>{href ? <Button asChild variant="outline" className="mt-3"><Link href={href}>{content.action}</Link></Button> : <Button variant="outline" className="mt-3" onClick={onRetry}>{content.action}</Button>}{error.requestId && <SupportCode value={error.requestId} />}</AlertDescription></Alert>;
}

function SupportCode({ value }: { value: string }) { return <p className="mt-3 font-mono text-xs text-muted-foreground">Código de suporte: {value}</p>; }
