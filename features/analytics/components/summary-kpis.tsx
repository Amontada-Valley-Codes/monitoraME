import { Wallet, Building2, MapPin, ArrowUpRight, Store, ChartPie } from 'lucide-react';
import { KpiCard } from '@/shared/components/kpi-card';
import { compactMoney, percent, ratio, delta, number } from '@/shared/lib/format';
import type { Aggregate, Filters } from '../data/types';
import { SIZES, ORIGINS } from '../data/fixtures';

export function SummaryKpis({ summary: a, previous: b, filters, extended = false, compact = false }: { summary: Aggregate; previous: Aggregate; filters: Filters; extended?: boolean; compact?: boolean }) {
  const scope = { sizeScope: SIZES.find((s) => s.id === filters.size)?.name ?? 'Todos', originScope: ORIGINS.find((o) => o.id === filters.origin)?.name ?? 'Todas' };

  return <div className={compact ? 'grid h-full grid-cols-1 grid-rows-2 gap-4 sm:grid-cols-2' : 'mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'}>
    <KpiCard {...scope} label="Total das compras consideradas" value={compactMoney(a.total)} detail={`${number(a.count)} empenhos · valor líquido`} change={delta(a.total, b.total)} icon={Wallet} />
    <KpiCard {...scope} sizeScope={filters.size === 'all' ? 'ME' : `${scope.sizeScope} ∩ ME`} label="Participação de ME" value={percent(ratio(a.mpe, a.total))} detail={`${compactMoney(a.mpe)} · Microempresas`} change={delta(ratio(a.mpe, a.total), ratio(b.mpe, b.total))} icon={ChartPie} highlight />
    {filters.origin === 'all' ? <><KpiCard {...scope} originScope="Município comprador" label="Compras com fornecedores locais" value={percent(ratio(a.local, a.total))} detail={`${compactMoney(a.local)} no município comprador`} change={delta(ratio(a.local, a.total), ratio(b.local, b.total))} icon={MapPin} /><KpiCard {...scope} originScope="Outros municípios + fora do CE" label="Recursos fora do município" value={percent(ratio(a.external, a.total))} detail={`${compactMoney(a.external)} · evasão municipal`} change={delta(a.external, b.external)} icon={ArrowUpRight} inverse /></> : <><KpiCard {...scope} sizeScope="MEI" label="Participação de MEI" value={percent(ratio(a.mei, a.total))} detail={compactMoney(a.mei)} change={delta(a.mei, b.mei)} icon={Store} /><KpiCard {...scope} label="Fornecedores identificados" value={number(a.suppliers)} detail="Estabelecimentos com empenhos no recorte" change={delta(a.suppliers, b.suppliers)} icon={Building2} /></>}
    {extended && <><KpiCard {...scope} sizeScope="ME" label="Microempresas" value={percent(ratio(a.me, a.total))} detail={compactMoney(a.me)} change={delta(a.me, b.me)} icon={Store} /><KpiCard {...scope} sizeScope="MEI" label="Microempreendedores individuais" value={percent(ratio(a.mei, a.total))} detail={compactMoney(a.mei)} change={delta(a.mei, b.mei)} icon={Store} />{filters.origin === 'all' && <KpiCard {...scope} sizeScope="ME" originScope="Município comprador" label="ME sediadas no município" value={percent(ratio(a.mpeLocal, a.total))} detail={compactMoney(a.mpeLocal)} change={delta(a.mpeLocal, b.mpeLocal)} icon={Building2} />}<KpiCard {...scope} label="Fornecedores identificados" value={number(a.suppliers)} detail="CNPJ de estabelecimento" change={delta(a.suppliers, b.suppliers)} icon={Building2} /></>}
  </div>;
}
