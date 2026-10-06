'use client';

import axios from 'axios';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SelectField } from '@/shared/components/select-field';
import { EmptyState, LoadingState } from '@/shared/components/states';
import { money, number } from '@/shared/lib/format';
import { AnalyticsApiError } from '../commitments/api';
import { formatCivilDate } from '../commitments/detail-format';
import { getCommitmentViewState } from '../commitments/error-state';
import { PageHeader } from '../components/page-header';
import { TceMunicipalitySelect } from '../components/tce-municipality-select';
import { fetchSuppliers } from '../suppliers/api';
import { buildSupplierDetailHref, canOpenSupplierDetail, formatSupplierDocument } from '../suppliers/navigation';
import { DEFAULT_SUPPLIER_FILTERS, nextSupplierSort, parseSupplierFilters, patchSupplierFilters, serializeSupplierFilters } from '../suppliers/query';
import type { SupplierListFilters, SupplierListResponse, SupplierSortField } from '../suppliers/types';

const COMPANY_SIZES = [
  ['MEI', 'Microempreendedor individual'], ['ME', 'Microempresa'],
  ['EPP', 'Empresa de pequeno porte'], ['OTHER', 'Outros portes'],
  ['UNKNOWN', 'Não identificado'],
] as const;
const SUPPLIER_ORIGINS = [
  ['NO_MUNICIPIO_COMPRADOR', 'No município comprador'],
  ['EM_OUTRO_MUNICIPIO', 'Em outro município'], ['FORA_DO_CEARA', 'Fora do Ceará'],
  ['ORIGEM_NAO_IDENTIFICADA', 'Origem não identificada'],
] as const;
const EXPENSE_ELEMENTS = [
  ['30', 'Material de consumo'], ['32', 'Material, bem ou serviço para distribuição gratuita'],
  ['35', 'Serviços de consultoria'], ['39', 'Outros serviços de terceiros — pessoa jurídica'],
  ['40', 'Serviços de TI e comunicação — pessoa jurídica'], ['51', 'Obras e instalações'],
  ['52', 'Equipamentos e material permanente'],
] as const;
const SIZE_LABELS: Record<string, string> = {
  MEI: 'Microempreendedor individual', ME: 'Microempresa', EPP: 'Empresa de pequeno porte',
  DEMAIS: 'Demais portes', NAO_IDENTIFICADO: 'Não identificado',
  OTHER: 'Outros portes', UNKNOWN: 'Não identificado',
};
const ORIGIN_LABELS: Record<string, string> = Object.fromEntries(SUPPLIER_ORIGINS);
const SORT_COLUMNS: Array<{ field: SupplierSortField; label: string; align?: 'right' }> = [
  { field: 'supplier', label: 'Fornecedor' },
  { field: 'commitments_count', label: 'Empenhos', align: 'right' },
  { field: 'first_commitment', label: 'Primeiro empenho' },
  { field: 'last_commitment', label: 'Último empenho' },
  { field: 'gross_value', label: 'Empenhado', align: 'right' },
  { field: 'cancelled_value', label: 'Anulado', align: 'right' },
  { field: 'net_value', label: 'Considerado', align: 'right' },
];

type SupplierRequestError = { status: number; message: string; requestId?: string };

function normalizeSupplierError(error: unknown): SupplierRequestError {
  if (error instanceof AnalyticsApiError) {
    return { status: error.status, message: error.message, requestId: error.requestId };
  }
  return { status: 500, message: 'Não foi possível carregar os fornecedores.' };
}

function FilterChecks({ title, options, selected, onChange }: {
  title: string;
  options: ReadonlyArray<readonly [string, string]>;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return <fieldset><legend className="mb-3 text-sm font-medium">{title}</legend><div className="space-y-3">
    {options.map(([value, label]) => <Label key={value} className="flex items-start gap-3 font-normal leading-snug">
      <Checkbox checked={selected.includes(value)} onCheckedChange={(checked) => onChange(checked === true ? [...selected, value] : selected.filter((item) => item !== value))} />
      {label}
    </Label>)}
  </div></fieldset>;
}

export default function Suppliers() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseSupplierFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
  const queryString = useMemo(() => serializeSupplierFilters(filters).toString(), [filters]);
  const [version, setVersion] = useState(0);
  const requestKey = `${queryString}:${version}`;
  const [requestState, setRequestState] = useState<{
    key: string; data: SupplierListResponse | null; error: SupplierRequestError | null;
  }>({ key: '', data: null, error: null });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  const replaceFilters = useCallback((next: SupplierListFilters) => {
    router.replace(`${pathname}?${serializeSupplierFilters(next)}`, { scroll: false });
  }, [pathname, router]);
  const updateFilters = useCallback((patch: Partial<SupplierListFilters>, resetPage = true) => {
    replaceFilters(patchSupplierFilters(filters, patch, resetPage));
  }, [filters, replaceFilters]);

  useEffect(() => { if (searchParams.toString() !== queryString) replaceFilters(filters); }, [filters, queryString, replaceFilters, searchParams]);
  useEffect(() => {
    const controller = new AbortController();
    fetchSuppliers(filters, controller.signal)
      .then((result) => setRequestState({ key: requestKey, data: result, error: null }))
      .catch((requestError: unknown) => {
        if (!axios.isCancel(requestError)) {
          setRequestState({ key: requestKey, data: null, error: normalizeSupplierError(requestError) });
        }
      });
    return () => controller.abort();
    // The serialized URL is the stable identity of this request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const loading = requestState.key !== requestKey;
  const data = requestState.data;
  const error = loading ? null : requestState.error;
  useEffect(() => {
    if (!loading && data && filters.page > Math.max(1, data.pagination.total_pages)) {
      updateFilters({ page: 1 }, false);
    }
  }, [data, filters.page, loading, updateFilters]);

  function changeSort(field: SupplierSortField) {
    updateFilters(nextSupplierSort(filters.sort_by, filters.sort_order, field));
  }

  const activeExtendedFilters = filters.company_sizes.length + filters.supplier_origins.length + filters.expense_element_codes.length;
  const firstItem = data && data.pagination.total_items ? (data.pagination.page - 1) * data.pagination.page_size + 1 : 0;
  const lastItem = data ? Math.min(data.pagination.page * data.pagination.page_size, data.pagination.total_items) : 0;
  const viewState = getCommitmentViewState(loading && !data, Boolean(error), data?.items.length ?? 0);

  return <>
    <PageHeader eyebrow="Ecossistema empresarial" title="Fornecedores" description="Consulte os fornecedores presentes nas compras públicas do recorte selecionado." />
    <section className="panel no-print mb-6 p-4" aria-label="Filtros de fornecedores">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.3fr_auto]">
        <div><Label htmlFor="supplier-start" className="filter-label">Data inicial</Label><Input id="supplier-start" type="date" value={filters.start_date} onChange={(event) => updateFilters({ start_date: event.target.value })} /></div>
        <div><Label htmlFor="supplier-end" className="filter-label">Data final</Label><Input id="supplier-end" type="date" value={filters.end_date} onChange={(event) => updateFilters({ end_date: event.target.value })} /></div>
        <div><Label className="filter-label">Município comprador</Label><TceMunicipalitySelect value={filters.municipality_tce_code} onValueChange={(municipality_tce_code) => updateFilters({ municipality_tce_code })} className="h-11" /></div>
        <div className="flex items-end"><Button type="button" variant="outline" className="w-full" onClick={() => { setDraft(filters); setFilterPanelOpen(true); }}><SlidersHorizontal />Mais filtros{activeExtendedFilters > 0 && <Badge>{activeExtendedFilters}</Badge>}</Button></div>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <SupplierSearch key={filters.search ?? ''} currentValue={filters.search ?? ''} onSearch={(search) => updateFilters({ search: search || undefined })} />
        <div className="flex items-center gap-2"><Label className="whitespace-nowrap text-sm text-muted-foreground">Itens por página</Label><SelectField label="Itens por página" value={String(filters.page_size)} onChange={(value) => updateFilters({ page_size: Number(value) as 20 | 50 | 100 })} options={[20, 50, 100].map((value) => ({ value: String(value), label: String(value) }))} className="w-20" /></div>
      </div>
    </section>

    <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Refinar fornecedores</SheetTitle><SheetDescription>Selecione uma ou mais opções em cada grupo.</SheetDescription></SheetHeader>
      <div className="space-y-7 p-6">
        <FilterChecks title="Porte empresarial" options={COMPANY_SIZES} selected={draft.company_sizes} onChange={(company_sizes) => setDraft({ ...draft, company_sizes })} />
        <FilterChecks title="Origem do fornecedor" options={SUPPLIER_ORIGINS} selected={draft.supplier_origins} onChange={(supplier_origins) => setDraft({ ...draft, supplier_origins })} />
        <FilterChecks title="Elemento de despesa" options={EXPENSE_ELEMENTS.map(([code, label]) => [code, `${code} · ${label}`] as const)} selected={draft.expense_element_codes} onChange={(expense_element_codes) => setDraft({ ...draft, expense_element_codes })} />
      </div>
      <SheetFooter><Button onClick={() => { updateFilters({ company_sizes: draft.company_sizes, supplier_origins: draft.supplier_origins, expense_element_codes: draft.expense_element_codes }); setFilterPanelOpen(false); }}>Aplicar filtros</Button><Button variant="outline" onClick={() => setDraft({ ...draft, company_sizes: [], supplier_origins: [], expense_element_codes: [] })}>Limpar seleção</Button></SheetFooter>
    </SheetContent></Sheet>

    {viewState === 'loading' ? <LoadingState /> : viewState === 'error' && error ? <SupplierError error={error} onRetry={() => setVersion((value) => value + 1)} /> : viewState === 'empty' ?
      <EmptyState title="Nenhum fornecedor encontrado" description="Ajuste o período ou os filtros para consultar outros fornecedores." onReset={() => replaceFilters(DEFAULT_SUPPLIER_FILTERS)} /> :
      data && <section className="panel overflow-hidden" aria-label="Lista de fornecedores" aria-busy={loading}>
        {loading && <div className="border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground" role="status">Atualizando resultados…</div>}
        <Table className="min-w-[1500px]"><TableHeader><TableRow>
          <SortableHead column={SORT_COLUMNS[0]} filters={filters} onSort={changeSort} />
          <TableHead>Documento</TableHead><TableHead>Origens no recorte</TableHead>
          <SortableHead column={SORT_COLUMNS[1]} filters={filters} onSort={changeSort} />
          <TableHead className="text-right">Anulações</TableHead><TableHead className="text-right">Municípios</TableHead>
          {SORT_COLUMNS.slice(2).map((column) => <SortableHead key={column.field} column={column} filters={filters} onSort={changeSort} />)}
        </TableRow></TableHeader><TableBody>{data.items.map((item) => {
          const detailHref = buildSupplierDetailHref(item, queryString);
          const navigable = canOpenSupplierDetail(item.documento) && Boolean(detailHref);
          const openDetail = () => { if (detailHref) router.push(detailHref); };
          return <TableRow key={`${item.tipo_documento}:${item.documento}`} tabIndex={navigable ? 0 : undefined} aria-label={navigable ? `Abrir fornecedor ${item.nome}` : undefined} className={navigable ? 'cursor-pointer' : undefined} onClick={navigable ? openDetail : undefined} onKeyDown={navigable ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDetail(); } } : undefined}>
            <TableCell className="max-w-72 whitespace-normal">{detailHref ? <Link href={detailHref} className="font-medium text-foreground hover:underline" onClick={(event) => event.stopPropagation()}>{item.nome}</Link> : <span className="font-medium">{item.nome}</span>}<div className="mt-1 flex flex-wrap gap-1.5"><Badge variant="outline">{SIZE_LABELS[item.porte] ?? item.porte}</Badge>{item.cadastro_status === 'NAO_DISPONIVEL' && <Badge variant="outline" className="text-muted-foreground">Cadastro não disponível</Badge>}</div></TableCell>
            <TableCell className="font-mono text-xs">{navigable ? formatSupplierDocument(item) : <Tooltip><TooltipTrigger asChild><span className="cursor-help underline decoration-dotted underline-offset-4">{formatSupplierDocument(item)}</span></TooltipTrigger><TooltipContent>Documento parcial: detalhe indisponível</TooltipContent></Tooltip>}</TableCell>
            <TableCell className="max-w-64 whitespace-normal"><div className="flex flex-wrap gap-1.5">{item.origens_no_recorte.length > 0 ? item.origens_no_recorte.map((origin, index) => <Badge key={`${origin}:${index}`} variant="outline" className="font-normal">{ORIGIN_LABELS[origin] ?? origin}</Badge>) : <span className="text-muted-foreground">—</span>}</div></TableCell>
            <TableCell className="data-value text-right">{number(item.quantidade_empenhos)}</TableCell><TableCell className="data-value text-right">{number(item.quantidade_anulacoes)}</TableCell><TableCell className="data-value text-right">{number(item.quantidade_municipios)}</TableCell>
            <TableCell>{item.primeiro_empenho ? formatCivilDate(item.primeiro_empenho) : '—'}</TableCell><TableCell>{item.ultimo_empenho ? formatCivilDate(item.ultimo_empenho) : '—'}</TableCell>
            <TableCell className="data-value text-right">{money(item.valores.valor_empenhado_centavos)}</TableCell><TableCell className="data-value text-right">{money(item.valores.valor_anulado_centavos)}</TableCell><TableCell className="data-value text-right font-medium">{money(item.valores.valor_considerado_centavos)}</TableCell>
          </TableRow>;
        })}</TableBody></Table>
        <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row"><p className="text-sm text-muted-foreground" aria-live="polite">{number(firstItem)}–{number(lastItem)} de {number(data.pagination.total_items)}</p><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Página {number(data.pagination.page)} de {number(Math.max(1, data.pagination.total_pages))}</span><Button variant="outline" size="icon" aria-label="Página anterior" disabled={!data.pagination.has_previous || loading} onClick={() => updateFilters({ page: filters.page - 1 }, false)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label="Próxima página" disabled={!data.pagination.has_next || loading} onClick={() => updateFilters({ page: filters.page + 1 }, false)}><ChevronRight /></Button></div></div>
      </section>}
  </>;
}

function SupplierSearch({
  currentValue,
  onSearch,
}: {
  currentValue: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(currentValue);
  useEffect(() => {
    const nextValue = value.trim().slice(0, 200);
    if (nextValue === currentValue) return;
    const timer = window.setTimeout(() => onSearch(nextValue), 400);
    return () => window.clearTimeout(timer);
  }, [currentValue, onSearch, value]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(value.trim().slice(0, 200));
  }

  return <form onSubmit={submit} className="flex min-w-0 flex-1 gap-2">
    <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="search" aria-label="Buscar fornecedor" className="pl-9" maxLength={200} placeholder="Nome ou documento" value={value} onChange={(event) => setValue(event.target.value)} /></div>
    <Button type="submit">Buscar</Button>
  </form>;
}

function SortableHead({ column, filters, onSort }: {
  column: (typeof SORT_COLUMNS)[number];
  filters: SupplierListFilters;
  onSort: (field: SupplierSortField) => void;
}) {
  const active = filters.sort_by === column.field;
  return <TableHead aria-sort={active ? filters.sort_order === 'asc' ? 'ascending' : 'descending' : 'none'} className={column.align === 'right' ? 'text-right' : undefined}>
    <Button variant="ghost" size="sm" className={column.align === 'right' ? '-mr-3 ml-auto' : '-ml-3'} onClick={() => onSort(column.field)}>{column.label}{!active ? <ArrowUpDown className="size-3.5 text-muted-foreground" /> : filters.sort_order === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}</Button>
  </TableHead>;
}

function SupplierError({ error, onRetry }: { error: SupplierRequestError; onRetry: () => void }) {
  const content = supplierErrorContent(error);
  return <Alert variant="destructive" className="panel p-6"><AlertTitle>{content.title}</AlertTitle><AlertDescription><p>{content.description}</p>{error.requestId && <p className="mt-2 text-xs">Código de suporte: {error.requestId}</p>}<Button variant="outline" className="mt-3" onClick={() => content.href ? window.location.assign(content.href) : onRetry()}>{content.action}</Button></AlertDescription></Alert>;
}

function supplierErrorContent(error: SupplierRequestError) {
  if (error.status === 0) return { title: 'Sem conexão', description: 'Verifique sua conexão e tente novamente.', action: 'Tentar novamente', href: null };
  if (error.status === 401) return { title: 'Sua sessão expirou', description: 'Entre novamente para continuar.', action: 'Entrar', href: '/login' };
  if (error.status === 403) return { title: 'Cadastro necessário', description: 'Conclua o cadastro da empresa para consultar os fornecedores.', action: 'Completar cadastro', href: '/request-access/company' };
  if (error.status === 422) return { title: 'Período ou filtro inválido', description: error.message, action: 'Revisar filtros', href: null };
  if (error.status === 503) return { title: 'Serviço indisponível', description: 'A consulta ao TCE está temporariamente indisponível.', action: 'Tentar novamente', href: null };
  return { title: 'Não foi possível carregar os fornecedores', description: error.message, action: 'Tentar novamente', href: null };
}
