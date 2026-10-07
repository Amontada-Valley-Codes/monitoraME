'use client';

import axios from 'axios';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EmptyState, LoadingState } from '@/shared/components/states';
import { SelectField } from '@/shared/components/select-field';
import { number } from '@/shared/lib/format';
import { fetchCommitments } from '../commitments/api';
import { DEFAULT_COMMITMENT_FILTERS, nextCommitmentSort, parseCommitmentFilters, patchCommitmentFilters, serializeCommitmentFilters } from '../commitments/query';
import type { CommitmentListFilters, CommitmentListResponse, CommitmentSortField } from '../commitments/types';
import { buildCommitmentDetailHref } from '../commitments/navigation';
import { CommitmentTable } from '../commitments/table';
import { getCommitmentErrorContent, getCommitmentViewState } from '../commitments/error-state';
import { PageHeader } from '../components/page-header';
import { TceMunicipalitySelect } from '../components/tce-municipality-select';
import { CATEGORIES } from '../data/fixtures';

const COMPANY_SIZES = [
  ['MEI', 'Microempreendedor individual'], ['ME', 'Microempresa'],
  ['EPP', 'Empresa de pequeno porte'], ['DEMAIS', 'Demais portes'],
  ['NAO_IDENTIFICADO', 'Não identificado'],
] as const;
const SUPPLIER_ORIGINS = [
  ['NO_MUNICIPIO_COMPRADOR', 'No município comprador'],
  ['EM_OUTRO_MUNICIPIO', 'Em outro município'], ['FORA_DO_CEARA', 'Fora do Ceará'],
  ['ORIGEM_NAO_IDENTIFICADA', 'Origem não identificada'],
] as const;
type RequestError = { status: number; message: string };

function normalizeRequestError(error: unknown): RequestError {
  if (!axios.isAxiosError(error)) return { status: 500, message: 'Não foi possível carregar os empenhos.' };
  const data = error.response?.data as { message?: string; detail?: string } | undefined;
  return { status: error.response?.status ?? 503, message: data?.message ?? data?.detail ?? 'Serviço temporariamente indisponível.' };
}

function FilterChecks({ title, options, selected, onChange }: {
  title: string; options: ReadonlyArray<readonly [string, string]>; selected: string[];
  onChange: (values: string[]) => void;
}) {
  return <fieldset><legend className="mb-3 text-sm font-medium">{title}</legend><div className="space-y-3">
    {options.map(([value, label]) => <Label key={value} className="flex items-start gap-3 font-normal leading-snug">
      <Checkbox checked={selected.includes(value)} onCheckedChange={(checked) => onChange(checked === true ? [...selected, value] : selected.filter((item) => item !== value))} />
      {label}
    </Label>)}
  </div></fieldset>;
}

export default function Expenses() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseCommitmentFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
  const queryString = useMemo(() => serializeCommitmentFilters(filters).toString(), [filters]);
  const [version, setVersion] = useState(0);
  const requestKey = `${queryString}:${version}`;
  const [requestState, setRequestState] = useState<{
    key: string;
    data: CommitmentListResponse | null;
    error: RequestError | null;
  }>({ key: '', data: null, error: null });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  const replaceFilters = useCallback((next: CommitmentListFilters) => {
    router.replace(`${pathname}?${serializeCommitmentFilters(next)}`, { scroll: false });
  }, [pathname, router]);
  const updateFilters = useCallback((patch: Partial<CommitmentListFilters>, resetPage = true) => {
    replaceFilters(patchCommitmentFilters(filters, patch, resetPage));
  }, [filters, replaceFilters]);

  useEffect(() => { if (searchParams.toString() !== queryString) replaceFilters(filters); }, [filters, queryString, replaceFilters, searchParams]);
  useEffect(() => {
    const controller = new AbortController();
    fetchCommitments(filters, controller.signal)
      .then((result) => setRequestState({ key: requestKey, data: result, error: null }))
      .catch((requestError) => {
        if (!axios.isCancel(requestError)) {
          setRequestState({ key: requestKey, data: null, error: normalizeRequestError(requestError) });
        }
      });
    return () => controller.abort();
    // The serialized query is the stable identity of this request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);
  const loading = requestState.key !== requestKey;
  const data = loading ? null : requestState.data;
  const error = loading ? null : requestState.error;
  useEffect(() => {
    if (data && data.pagination.total_pages > 0 && filters.page > data.pagination.total_pages) updateFilters({ page: 1 }, false);
  }, [data, filters.page, updateFilters]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('search') ?? '').trim();
    updateFilters({ search: value || undefined });
  }
  function changeSort(field: CommitmentSortField) {
    updateFilters(nextCommitmentSort(filters.sort_by, filters.sort_order, field));
  }
  function openDetail(key: string) {
    const from = `${pathname}?${queryString}`;
    router.push(buildCommitmentDetailHref(key, from));
  }

  const activeExtendedFilters = filters.company_sizes.length + filters.supplier_origins.length + filters.expense_element_codes.length;
  const firstItem = data && data.pagination.total_items ? (data.pagination.page - 1) * data.pagination.page_size + 1 : 0;
  const lastItem = data ? Math.min(data.pagination.page * data.pagination.page_size, data.pagination.total_items) : 0;
  const viewState = getCommitmentViewState(loading, Boolean(error), data?.items.length ?? 0);

  return <>
    <PageHeader eyebrow="Exploração dos dados" title="Despesas empenhadas" description="Consulte empenhos do TCE por período, município, fornecedor e elemento de despesa." />
    <section className="panel no-print mb-6 p-4" aria-label="Filtros de empenhos">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.3fr_auto]">
        <div><Label htmlFor="commitment-start" className="filter-label">Data inicial</Label><Input id="commitment-start" type="date" value={filters.start_date} onChange={(event) => updateFilters({ start_date: event.target.value })} /></div>
        <div><Label htmlFor="commitment-end" className="filter-label">Data final</Label><Input id="commitment-end" type="date" value={filters.end_date} onChange={(event) => updateFilters({ end_date: event.target.value })} /></div>
        <div><Label className="filter-label">Município comprador</Label><TceMunicipalitySelect value={filters.municipality_tce_code} onValueChange={(municipality_tce_code) => updateFilters({ municipality_tce_code })} className="h-11" /></div>
        <div className="flex items-end"><Button type="button" variant="outline" className="w-full" onClick={() => { setDraft(filters); setFilterPanelOpen(true); }}><SlidersHorizontal />Mais filtros{activeExtendedFilters > 0 && <Badge>{activeExtendedFilters}</Badge>}</Button></div>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={submitSearch} className="flex min-w-0 flex-1 gap-2">
          <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input key={filters.search ?? ''} name="search" aria-label="Buscar empenho ou fornecedor" className="pl-9" maxLength={200} placeholder="Número do empenho, fornecedor ou identificador" defaultValue={filters.search ?? ''} /></div>
          <Button type="submit">Buscar</Button>
        </form>
        <div className="flex items-center gap-2"><Label className="whitespace-nowrap text-sm text-muted-foreground">Itens por página</Label><SelectField label="Itens por página" value={String(filters.page_size)} onChange={(value) => updateFilters({ page_size: Number(value) as 20 | 50 | 100 })} options={[20, 50, 100].map((value) => ({ value: String(value), label: String(value) }))} className="w-20" /></div>
      </div>
    </section>

    <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Refinar empenhos</SheetTitle><SheetDescription>Selecione uma ou mais opções em cada grupo.</SheetDescription></SheetHeader>
      <div className="space-y-7 p-6">
        <FilterChecks title="Porte empresarial" options={COMPANY_SIZES} selected={draft.company_sizes} onChange={(company_sizes) => setDraft({ ...draft, company_sizes })} />
        <FilterChecks title="Origem do fornecedor" options={SUPPLIER_ORIGINS} selected={draft.supplier_origins} onChange={(supplier_origins) => setDraft({ ...draft, supplier_origins })} />
        <FilterChecks title="Elemento de despesa" options={CATEGORIES.map((item) => [item.id, `${item.id} · ${item.name}`] as const)} selected={draft.expense_element_codes} onChange={(expense_element_codes) => setDraft({ ...draft, expense_element_codes })} />
      </div>
      <SheetFooter><Button onClick={() => { updateFilters({ company_sizes: draft.company_sizes, supplier_origins: draft.supplier_origins, expense_element_codes: draft.expense_element_codes }); setFilterPanelOpen(false); }}>Aplicar filtros</Button><Button variant="outline" onClick={() => setDraft({ ...draft, company_sizes: [], supplier_origins: [], expense_element_codes: [] })}>Limpar seleção</Button></SheetFooter>
    </SheetContent></Sheet>

    {viewState === 'loading' ? <LoadingState /> : viewState === 'error' && error ? <CommitmentError error={error} onRetry={() => setVersion((value) => value + 1)} /> : viewState === 'empty' ?
      <EmptyState title="Nenhum empenho encontrado" description="Ajuste o período ou os filtros para consultar outros registros." onReset={() => replaceFilters(DEFAULT_COMMITMENT_FILTERS)} /> :
      data && <section className="panel overflow-hidden" aria-label="Lista de empenhos"><CommitmentTable items={data.items} sortBy={filters.sort_by} sortOrder={filters.sort_order} onSort={changeSort} onOpen={openDetail} />
      <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row"><p className="text-sm text-muted-foreground" aria-live="polite">{number(firstItem)}–{number(lastItem)} de {number(data.pagination.total_items)}</p><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Página {number(data.pagination.page)} de {number(Math.max(1, data.pagination.total_pages))}</span><Button variant="outline" size="icon" aria-label="Página anterior" disabled={!data.pagination.has_previous} onClick={() => updateFilters({ page: filters.page - 1 }, false)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label="Próxima página" disabled={!data.pagination.has_next} onClick={() => updateFilters({ page: filters.page + 1 }, false)}><ChevronRight /></Button></div></div>
      </section>}
  </>;
}

function CommitmentError({ error, onRetry }: { error: RequestError; onRetry: () => void }) {
  const content = getCommitmentErrorContent(error.status, error.message);
  return <Alert variant="destructive" className="panel p-6"><AlertTitle>{content.title}</AlertTitle><AlertDescription><p>{content.description}</p><Button variant="outline" className="mt-3" onClick={() => content.href ? window.location.assign(content.href) : onRetry()}>{content.action}</Button></AlertDescription></Alert>;
}
