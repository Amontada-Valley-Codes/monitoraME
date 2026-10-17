'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { money } from '@/shared/lib/format';
import type { PipelineOverviewParams } from '../pipeline/types';
import { useOverviewExpenseElements } from '../pipeline/use-overview';

export function ExpenseOverviewTable({ params }: { params: PipelineOverviewParams }) {
  const { data } = useOverviewExpenseElements(params);
  const [query, setQuery] = useState('');
  const rows = (data ?? []).filter((item) => `${item.name} ${item.key}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));

  return (
    <section className="overview-data-table" aria-labelledby="expense-table-heading">
      <div className="overview-table-header">
        <div><h2 id="expense-table-heading">Elementos de despesa</h2><p>Valores líquidos de Micro Empresas · Fonte: TCE-CE</p></div>
        <div className="overview-table-tools">
          <label className="overview-table-search"><Search size={15} /><span className="sr-only">Buscar elemento de despesa</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar elemento..." /></label>
          <span className="overview-table-filter" aria-hidden="true">Filtrar <SlidersHorizontal size={14} /></span>
        </div>
      </div>
      <div className="overview-table-scroll">
        <table>
          <thead><tr><th scope="col">Elemento de despesa</th><th scope="col">Código</th><th scope="col">Fonte</th><th scope="col">Valor líquido</th></tr></thead>
          <tbody>
            {rows.length ? rows.map((item) => <tr key={item.key}><td>{item.name}</td><td><span className="overview-code">{item.key}</span></td><td>TCE-CE</td><td className="overview-money">{money(item.value)}</td></tr>) : <tr><td colSpan={4}>{query ? 'Nenhum elemento corresponde à busca.' : 'Nenhum elemento publicado para o período.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
