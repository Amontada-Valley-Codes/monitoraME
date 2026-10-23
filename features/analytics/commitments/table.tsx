'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { dateLabel, money, number } from '@/shared/lib/format';
import type { CommitmentListItem, CommitmentSortField, SortOrder } from './types';

const COLUMNS: Array<{ field: CommitmentSortField; label: string; align?: 'right' }> = [
  { field: 'date', label: 'Data' },
  { field: 'municipality', label: 'Município' },
  { field: 'supplier', label: 'Fornecedor' },
  { field: 'expense_element', label: 'Elemento de despesa' },
  { field: 'net_value', label: 'Valor líquido', align: 'right' },
];

export function CommitmentTable({
  items,
  sortBy,
  sortOrder,
  omitSupplier = false,
  onSort,
  onOpen,
}: {
  items: CommitmentListItem[];
  sortBy: CommitmentSortField;
  sortOrder: SortOrder;
  omitSupplier?: boolean;
  onSort: (field: CommitmentSortField) => void;
  onOpen: (key: string) => void;
}) {
  const columns = omitSupplier ? COLUMNS.filter((column) => column.field !== 'supplier') : COLUMNS;
  return <Table className="min-w-[960px] w-full table-fixed"><TableHeader className="bg-muted/55"><TableRow className="hover:bg-muted/55">{columns.map((column) => {
    const active = sortBy === column.field;
    return <TableHead key={column.field} aria-sort={active ? sortOrder === 'asc' ? 'ascending' : 'descending' : 'none'} className={`h-12 px-2 text-xs font-semibold tracking-wide text-muted-foreground xl:px-4 ${column.align === 'right' ? 'text-right' : ''}`}>
      <Button variant="ghost" size="sm" className={column.align === 'right' ? '-mr-3 ml-auto text-xs' : '-ml-3 text-xs'} onClick={() => onSort(column.field)}>{column.label}{!active ? <ArrowUpDown className="size-3.5 opacity-45" /> : sortOrder === 'asc' ? <ArrowUp className="size-3.5 text-primary" /> : <ArrowDown className="size-3.5 text-primary" />}</Button>
    </TableHead>;
  })}<TableHead className="w-12 px-3"><span className="sr-only">Abrir detalhes</span></TableHead></TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={item.chave_empenho} tabIndex={0} className="group h-[76px] cursor-pointer hover:bg-accent/45 focus-visible:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" aria-label={`Abrir empenho ${item.display_id}`} onClick={() => onOpen(item.chave_empenho)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(item.chave_empenho); } }}>
    <TableCell className="whitespace-normal px-2 py-3 xl:px-4"><span className="font-medium text-foreground">{dateLabel(item.data_empenho)}</span><span className="mt-1 block break-all font-mono text-[0.6875rem] text-muted-foreground">{item.display_id}</span></TableCell>
    <TableCell className="whitespace-normal px-2 py-3 xl:px-4"><span className="font-medium text-foreground">{item.municipio_comprador.nome}</span><span className="mt-1 block text-xs text-muted-foreground">{item.municipio_comprador.uf} · Código {item.municipio_comprador.codigo_tce}</span></TableCell>
    {!omitSupplier && <TableCell className="whitespace-normal px-2 py-3 xl:px-4"><span className="line-clamp-2 font-medium text-foreground">{item.fornecedor.nome}</span><Badge variant="secondary" className="mt-1.5 block w-fit font-normal">{item.fornecedor.porte}</Badge></TableCell>}
    <TableCell className="whitespace-normal px-2 py-3 xl:px-4"><span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{item.elemento_despesa.codigo_exibicao}</span><span className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{item.elemento_despesa.nome}</span></TableCell>
    <TableCell className="whitespace-normal px-2 py-3 text-right xl:px-4"><span className="data-value block text-sm font-semibold tabular-nums text-foreground">{money(item.valores.valor_liquido_centavos)}</span>{item.possui_anulacao && <Tooltip><TooltipTrigger asChild><Badge variant="outline" className="mt-1.5 ml-auto block w-fit border-destructive/30 bg-destructive/5 text-destructive">Possui anulação</Badge></TooltipTrigger><TooltipContent>{number(item.quantidade_anulacoes)} {item.quantidade_anulacoes === 1 ? 'anulação registrada' : 'anulações registradas'}</TooltipContent></Tooltip>}</TableCell>
    <TableCell className="px-3 py-3 text-right"><ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden /></TableCell>
  </TableRow>)}</TableBody></Table>;
}
