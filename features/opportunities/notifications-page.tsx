'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlarmClock, BellRing, CalendarDays, Check, ChevronLeft, ChevronRight,
  Clock3, FileText, MapPin, Target, Trash2, UserRound, UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/states';
import { cn } from '@/lib/utils';
import { companyDemoFixture, type NotificationItem } from './demo-fixture';
import { useNotifications } from './notification-context';
import type { DemoScenario } from './notification-repository';

const PAGE_SIZE = 8;
type Filter = 'all' | 'individual' | 'grouped';
const iconByType = { match: Target, closing: CalendarDays, official_update: FileText, date_change: CalendarDays, document_expiry: AlarmClock, cancelled: AlarmClock, internal_deadline: Clock3, result: UsersRound, assignee: UserRound } as const;
const date = (value: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead, deleteMany } = useNotifications();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [scenario, setScenario] = useState<DemoScenario>('success');
  const [selectedId, setSelectedId] = useState(notifications[0]?.id ?? '');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set());
  const filtered = useMemo(() => notifications.filter((item) => filter === 'all' || (filter === 'grouped' ? item.priority === 'grouped' : item.priority !== 'grouped')), [notifications, filter]);
  const total = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = notifications.find((item) => item.id === selectedId) ?? notifications[0];
  const individualCount = notifications.filter((item) => item.priority !== 'grouped').length;
  const groupedCount = notifications.filter((item) => item.priority === 'grouped').length;
  const allPageItemsChecked = items.length > 0 && items.every((item) => checkedIds.has(item.id));

  const changeFilter = (value: Filter) => { setFilter(value); setPage(1); };
  const toggleChecked = (id: string) => setCheckedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const togglePage = () => setCheckedIds((current) => {
    const next = new Set(current);
    if (allPageItemsChecked) items.forEach((item) => next.delete(item.id));
    else items.forEach((item) => next.add(item.id));
    return next;
  });
  const deleteSelected = () => {
    const ids = [...checkedIds];
    deleteMany(ids);
    setCheckedIds(new Set());
  };
  return <main className="min-h-[calc(100svh-var(--header-height))] min-w-0 flex-1 bg-muted/20 px-4 py-5 sm:px-7 lg:px-8">
      <header className="mx-auto mb-6 flex max-w-[1480px] items-center gap-4">
        <div className="min-w-0 flex-1"><h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Central de notificações</h1><p className="mt-1 text-sm text-muted-foreground sm:text-base">Acompanhe os alertas do Radar e da operação da sua empresa.</p></div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
        <Card className="min-w-0 gap-0 overflow-hidden py-0 shadow-sm">
          <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center">
            <div className="min-w-32 border-r-0 pr-5 lg:border-r"><strong className="block text-3xl leading-none text-primary">{unreadCount}</strong><small className="text-muted-foreground">não lidas</small></div>
            <div className="flex flex-1 flex-wrap gap-1">
              <FilterButton active={filter === 'all'} onClick={() => changeFilter('all')} label="Todas" count={notifications.length} />
              <FilterButton active={filter === 'individual'} onClick={() => changeFilter('individual')} label="Individuais" count={individualCount} />
              <FilterButton active={filter === 'grouped'} onClick={() => changeFilter('grouped')} label="Agrupadas" count={groupedCount} />
            </div>
            <Button variant="outline" size="sm" disabled={!unreadCount} onClick={markAllRead}>Marcar todas como lidas</Button>
          </div>
          <div className="flex items-center gap-2 border-b px-4 py-3 text-xs text-muted-foreground"><Checkbox checked={allPageItemsChecked} onCheckedChange={togglePage} aria-label={allPageItemsChecked ? 'Desmarcar notificações desta página' : 'Selecionar notificações desta página'} /><span>{checkedIds.size ? `${checkedIds.size} selecionada${checkedIds.size > 1 ? 's' : ''}` : 'Selecionar para excluir'}</span>{checkedIds.size > 0 && <Button variant="ghost" size="sm" className="ml-2 text-destructive hover:text-destructive" onClick={deleteSelected}><Trash2 className="size-4 text-primary" />Excluir</Button>}<span className="ml-auto">Mais recentes</span></div>

          <div className="hidden px-4 py-3 sm:flex sm:justify-end"><label className="sr-only" htmlFor="demo-scenario">Cenário da demonstração</label><NativeSelect id="demo-scenario" size="sm" value={scenario} onChange={(event) => setScenario(event.target.value as DemoScenario)}><NativeSelectOption value="success">Cenário: com dados</NativeSelectOption><NativeSelectOption value="loading">Cenário: carregando</NativeSelectOption><NativeSelectOption value="empty">Cenário: vazio</NativeSelectOption><NativeSelectOption value="error">Cenário: erro</NativeSelectOption><NativeSelectOption value="blocked">Cenário: plano bloqueado</NativeSelectOption></NativeSelect></div>
          {scenario === 'loading' && <LoadingState label="Carregando notificações" />}
          {scenario === 'error' && <div className="p-6"><ErrorState onRetry={() => setScenario('success')} /></div>}
          {/* {scenario === 'empty' && <div className="p-6"><EmptyState title="Nenhuma notificação por aqui" description="Novos alertas relevantes aparecerão nesta central." /></div>}                                                                                                                                   implantar campo certo */}
          {scenario === 'blocked' && <div className="p-10 text-center"><h2 className="font-semibold">Central disponível no plano Equipe</h2><p className="mt-2 text-sm text-muted-foreground">O acesso está bloqueado neste cenário demonstrativo.</p><Button asChild className="mt-4" variant="outline"><Link href="#">Conhecer planos</Link></Button></div>}
          {scenario === 'success' && <div className="px-1 sm:px-2">{items.map((item) => <NotificationListRow key={item.id} item={item} selected={selected?.id === item.id} checked={checkedIds.has(item.id)} onSelect={() => setSelectedId(item.id)} onToggleChecked={() => toggleChecked(item.id)} />)}</div>}
          {scenario === 'success' && <footer className="flex items-center justify-center gap-2 border-t px-4 py-3"><Button size="icon-sm" variant="ghost" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft /><span className="sr-only">Página anterior</span></Button>{Array.from({ length: total }, (_, index) => <Button key={index} size="icon-sm" variant={page === index + 1 ? 'default' : 'ghost'} onClick={() => setPage(index + 1)}>{index + 1}</Button>)}<Button size="icon-sm" variant="ghost" disabled={page === total} onClick={() => setPage((value) => value + 1)}><ChevronRight /><span className="sr-only">Próxima página</span></Button><span className="ml-auto hidden text-xs text-muted-foreground sm:block">{items.length} de {filtered.length} notificações</span></footer>}
        </Card>
        {selected && scenario === 'success' && <NotificationDetail item={selected} onRead={() => markRead(selected.id)} />}
      </div>
      <p className="mx-auto mt-4 max-w-[1480px] text-center text-xs text-muted-foreground">Ambiente demonstrativo · fixture company-demo-nordeste · leitura mantida nesta sessão</p>
    </main>;
}

function FilterButton({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return <Button variant={active ? 'default' : 'outline'} className="h-14 min-w-28 flex-col gap-0" onClick={onClick}><span>{label}</span><span className={cn('text-xs', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{count}</span></Button>;
}

function NotificationListRow({ item, selected, checked, onSelect, onToggleChecked }: { item: NotificationItem; selected: boolean; checked: boolean; onSelect: () => void; onToggleChecked: () => void }) {
  const Icon = iconByType[item.type as keyof typeof iconByType] ?? BellRing;
  return <article className={cn('group flex cursor-pointer items-center gap-3 border-b px-2 py-4 transition-colors sm:px-3', selected && 'rounded-lg border border-primary/15 bg-primary/[0.055]', !selected && 'hover:bg-muted/40', item.read && 'text-muted-foreground opacity-70')} onClick={onSelect} aria-current={selected ? 'true' : undefined}>
    <Checkbox checked={checked} onCheckedChange={onToggleChecked} onClick={(event) => event.stopPropagation()} aria-label={checked ? `Desmarcar ${item.title} para exclusão` : `Selecionar ${item.title} para exclusão`} />
    <span className={cn('size-2 shrink-0 rounded-full', item.read ? 'invisible' : 'bg-primary')} aria-hidden />
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Icon className="size-4" /></span>
    <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{item.title}</h2><p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p><div className="mt-2 flex flex-wrap gap-1.5">{item.score && <Badge variant="secondary">Score {item.score}%</Badge>}{item.severity === 'critical' && <Badge className="bg-warning-soft text-warning hover:bg-warning-soft">Alta prioridade</Badge>}{item.priority === 'grouped' && <Badge variant="outline">{item.groupCount} oportunidades agrupadas</Badge>}</div></div>
    <time className="hidden shrink-0 self-start text-xs text-muted-foreground sm:block">{date(item.createdAt)}</time>
  </article>;
}

function NotificationDetail({ item, onRead }: { item: NotificationItem; onRead: () => void }) {
  const opportunity = companyDemoFixture.opportunities.find((entry) => entry.id === item.opportunityId);
  const reasons = opportunity?.matchReasons ?? [item.reason];
  return <Card className="sticky top-5 hidden h-fit gap-0 overflow-hidden py-0 shadow-sm xl:block">
    <div className="p-5"><div><Badge className={item.severity === 'critical' ? 'bg-warning-soft text-warning hover:bg-warning-soft' : ''} variant={item.severity === 'critical' ? 'secondary' : 'secondary'}>{item.severity === 'critical' ? 'Alta prioridade' : item.priority === 'grouped' ? 'Agrupada' : 'Informativa'}</Badge></div>
      <div className={cn('mt-4', item.read && 'text-muted-foreground opacity-75')}><h2 className="text-xl font-bold leading-tight">{item.title}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p></div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-b pb-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays className="size-4" />{date(item.createdAt)}</span><span className="flex items-center gap-2"><MapPin className="size-4" />{opportunity ? `${opportunity.city}/${opportunity.state}` : 'Nordeste Conecta'}</span></div>
      {item.score && <div className="mt-5 flex items-center justify-between border-b pb-5"><span className="text-sm text-muted-foreground">Score de compatibilidade</span><span className="grid size-16 place-items-center rounded-full border-4 border-success text-lg font-bold text-success">{item.score}%</span><span className="text-sm">Confiança <b>{item.confidence}%</b></span></div>}
      <section className="border-b py-5"><h3 className="text-sm font-semibold">Motivos da compatibilidade</h3><ul className="mt-3 space-y-2">{reasons.map((reason) => <li key={reason} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-success" />{reason}</li>)}</ul></section>
      {!!item.relatedCnaes?.length && <section className="border-b py-5"><h3 className="text-sm font-semibold">CNAEs relacionados</h3><div className="mt-3 flex flex-wrap gap-2">{item.relatedCnaes.map((cnae) => <Badge key={cnae} variant="secondary">{cnae}</Badge>)}</div></section>}
      {opportunity && <section className="py-5"><h3 className="text-sm font-semibold">Dados da oportunidade</h3><dl className="mt-3 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-xs"><dt className="text-muted-foreground">Órgão</dt><dd>{opportunity.organization}</dd><dt className="text-muted-foreground">Município</dt><dd>{opportunity.city}/{opportunity.state}</dd><dt className="text-muted-foreground">Modalidade</dt><dd>{opportunity.modality}</dd><dt className="text-muted-foreground">Encerramento</dt><dd>{date(opportunity.closingDate)}</dd><dt className="text-muted-foreground">Valor estimado</dt><dd>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opportunity.estimatedValue)}</dd></dl></section>}
      {item.stale && <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">Evento desatualizado. A ação original foi substituída por um destino seguro.</p>}
      <Button asChild className="w-full"><Link href={item.destination.href} onClick={onRead}>{item.destination.label}<ChevronRight /></Link></Button>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">E-mails críticos seguem a política do sistema. Não há envio real nesta demonstração.</p>
    </div>
  </Card>;
}
