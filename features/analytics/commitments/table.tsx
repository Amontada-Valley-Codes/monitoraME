'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

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
  { field: 'gross_value', label: 'Empenhado', align: 'right' },
  { field: 'cancelled_value', label: 'Anulado', align: 'right' },
  { field: 'net_value', label: 'Líquido', align: 'right' },
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
  return <Table className="min-w-[1050px]"><TableHeader><TableRow>{columns.map((column) => {
    const active = sortBy === column.field;
    return <TableHead key={column.field} aria-sort={active ? sortOrder === 'asc' ? 'ascending' : 'descending' : 'none'} className={column.align === 'right' ? 'text-right' : undefined}>
      <Button variant="ghost" size="sm" className={column.align === 'right' ? '-mr-3 ml-auto' : '-ml-3'} onClick={() => onSort(column.field)}>{column.label}{!active ? <ArrowUpDown className="size-3.5 text-muted-foreground" /> : sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}</Button>
    </TableHead>;
  })}</TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={item.chave_empenho} tabIndex={0} className="cursor-pointer" aria-label={`Abrir empenho ${item.display_id}`} onClick={() => onOpen(item.chave_empenho)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(item.chave_empenho); } }}>
    <TableCell><span>{dateLabel(item.data_empenho)}</span><span className="mt-1 block font-mono text-xs text-muted-foreground">{item.display_id}</span></TableCell>
    <TableCell>{item.municipio_comprador.nome}<span className="block text-xs text-muted-foreground">{item.municipio_comprador.uf} · TCE {item.municipio_comprador.codigo_tce}</span></TableCell>
    {!omitSupplier && <TableCell className="max-w-64 whitespace-normal"><span className="font-medium">{item.fornecedor.nome}</span><Badge variant="outline" className="mt-1 block w-fit">{item.fornecedor.porte}</Badge></TableCell>}
    <TableCell className="max-w-64 whitespace-normal"><span className="font-mono text-xs">{item.elemento_despesa.codigo_exibicao}</span><span className="mt-1 block text-xs text-muted-foreground">{item.elemento_despesa.nome}</span></TableCell>
    <TableCell className="data-value text-right">{money(item.valores.valor_empenhado_centavos)}</TableCell>
    <TableCell className="data-value text-right"><span>{money(item.valores.valor_anulado_centavos)}</span>{item.possui_anulacao && <Tooltip><TooltipTrigger asChild><Badge variant="outline" className="mt-1 ml-auto block w-fit text-destructive">Anulado</Badge></TooltipTrigger><TooltipContent>{number(item.quantidade_anulacoes)} {item.quantidade_anulacoes === 1 ? 'anulação' : 'anulações'}</TooltipContent></Tooltip>}</TableCell>
    <TableCell className="data-value text-right font-medium">{money(item.valores.valor_liquido_centavos)}</TableCell>
  </TableRow>)}</TableBody></Table>;
}
