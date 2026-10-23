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
import { COMMITMENT_EXERCISES, commitmentExerciseFilters, DEFAULT_COMMITMENT_FILTERS, nextCommitmentSort, normalizeExpenseElementCode, parseCommitmentFilters, patchCommitmentFilters, serializeCommitmentFilters } from '../commitments/query';
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
  const totalPages = data ? Math.max(1, Math.ceil(data.pagination.total_items / 20)) : 1;
  useEffect(() => {
    if (data && filters.page > totalPages) updateFilters({ page: 1 }, false);
  }, [data, filters.page, totalPages, updateFilters]);

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
  const firstItem = data && data.pagination.total_items ? (filters.page - 1) * 20 + 1 : 0;
  const lastItem = data ? Math.min(filters.page * 20, data.pagination.total_items) : 0;
  const visibleItems = data?.items.slice(0, 20) ?? [];
  const visiblePages = data
    ? [...new Set([1, filters.page - 1, filters.page, filters.page + 1, totalPages])]
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((left, right) => left - right)
    : [];
  const viewState = getCommitmentViewState(loading, Boolean(error), data?.items.length ?? 0);

  return <>
    <PageHeader eyebrow="Exploração dos dados" title="Despesas empenhadas" description="Consulte empenhos públicos por exercício, município, fornecedor e elemento de despesa." />
    <section className="panel no-print mb-6 p-4" aria-label="Filtros de empenhos">
      <div className="grid gap-3 lg:grid-cols-[0.7fr_1.3fr_auto]">
        <div><Label className="filter-label">Exercício</Label><SelectField label="Selecionar exercício" value={filters.start_date.slice(0, 4)} onChange={(exercise) => updateFilters(commitmentExerciseFilters(exercise))} options={COMMITMENT_EXERCISES.map((exercise) => ({ value: exercise, label: `Exercício ${exercise}` }))} className="h-11" /></div>
        <div><Label className="filter-label">Município comprador</Label><TceMunicipalitySelect value={filters.municipality_tce_code} onValueChange={(municipality_tce_code) => updateFilters({ municipality_tce_code })} className="h-11" /></div>
        <div className="flex items-end"><Button type="button" variant="outline" className="w-full" onClick={() => { setDraft(filters); setFilterPanelOpen(true); }}><SlidersHorizontal />Mais filtros{activeExtendedFilters > 0 && <Badge>{activeExtendedFilters}</Badge>}</Button></div>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={submitSearch} className="flex min-w-0 flex-1 gap-2">
          <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input key={filters.search ?? ''} name="search" aria-label="Buscar empenho ou fornecedor" className="pl-9" maxLength={200} placeholder="Número do empenho, fornecedor ou identificador" defaultValue={filters.search ?? ''} /></div>
          <Button type="submit">Buscar</Button>
        </form>
        <p className="self-center text-xs text-muted-foreground sm:pl-2">Até 20 empenhos por página</p>
      </div>
    </section>

    <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Refinar empenhos</SheetTitle><SheetDescription>Selecione uma ou mais opções em cada grupo.</SheetDescription></SheetHeader>
      <div className="space-y-7 p-6">
        <FilterChecks title="Porte empresarial" options={COMPANY_SIZES} selected={draft.company_sizes} onChange={(company_sizes) => setDraft({ ...draft, company_sizes })} />
        <FilterChecks title="Origem do fornecedor" options={SUPPLIER_ORIGINS} selected={draft.supplier_origins} onChange={(supplier_origins) => setDraft({ ...draft, supplier_origins })} />
        <FilterChecks title="Elemento de despesa" options={CATEGORIES.map((item) => { const code = normalizeExpenseElementCode(item.id) ?? item.id; return [code, `${code} · ${item.name}`] as const; })} selected={draft.expense_element_codes} onChange={(expense_element_codes) => setDraft({ ...draft, expense_element_codes })} />
      </div>
      <SheetFooter><Button onClick={() => { updateFilters({ company_sizes: draft.company_sizes, supplier_origins: draft.supplier_origins, expense_element_codes: draft.expense_element_codes }); setFilterPanelOpen(false); }}>Aplicar filtros</Button><Button variant="outline" onClick={() => setDraft({ ...draft, company_sizes: [], supplier_origins: [], expense_element_codes: [] })}>Limpar seleção</Button></SheetFooter>
    </SheetContent></Sheet>

    {viewState === 'loading' ? <LoadingState /> : viewState === 'error' && error ? <CommitmentError error={error} onRetry={() => setVersion((value) => value + 1)} /> : viewState === 'empty' ?
      <EmptyState title="Nenhum empenho encontrado" description="Ajuste o período ou os filtros para consultar outros registros." onReset={() => replaceFilters(DEFAULT_COMMITMENT_FILTERS)} /> :
      data && <section className="panel overflow-hidden" aria-label="Lista de empenhos" aria-busy={loading}>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-card px-5 py-4">
          <div>
            <h2 className="font-semibold text-foreground">Empenhos encontrados</h2>
            <p className="mt-1 text-sm text-muted-foreground">{number(data.pagination.total_items)} registros no recorte selecionado</p>
          </div>
          <p className="text-xs text-muted-foreground">Até 20 empenhos por página · selecione uma linha para ver os detalhes</p>
        </div>
        <CommitmentTable items={visibleItems} sortBy={filters.sort_by} sortOrder={filters.sort_order} onSort={changeSort} onOpen={openDetail} />
        <nav className="flex flex-col items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:px-5" aria-label="Paginação dos empenhos">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Exibindo <span className="font-medium tabular-nums text-foreground">{number(firstItem)}–{number(lastItem)}</span> de {number(data.pagination.total_items)}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="size-9" aria-label="Página anterior" disabled={filters.page <= 1} onClick={() => updateFilters({ page: filters.page - 1 }, false)}><ChevronLeft /></Button>
            {visiblePages.map((page, index) => {
              const previous = visiblePages[index - 1];
              return <span key={page} className="flex items-center gap-1.5">
                {previous && page - previous > 1 && <span className="px-1 text-sm text-muted-foreground" aria-hidden="true">…</span>}
                <Button variant={page === filters.page ? 'default' : 'outline'} size="icon" className="size-9 tabular-nums" aria-label={`Página ${page}`} aria-current={page === filters.page ? 'page' : undefined} onClick={() => updateFilters({ page }, false)}>{page}</Button>
              </span>;
            })}
            <Button variant="outline" size="icon" className="size-9" aria-label="Próxima página" disabled={filters.page >= totalPages} onClick={() => updateFilters({ page: filters.page + 1 }, false)}><ChevronRight /></Button>
          </div>
        </nav>
      </section>}
  </>;
}

function CommitmentError({ error, onRetry }: { error: RequestError; onRetry: () => void }) {
  const content = getCommitmentErrorContent(error.status, error.message);
  return <Alert variant="destructive" className="panel p-6"><AlertTitle>{content.title}</AlertTitle><AlertDescription><p>{content.description}</p><Button variant="outline" className="mt-3" onClick={() => content.href ? window.location.assign(content.href) : onRetry()}>{content.action}</Button></AlertDescription></Alert>;
}
