'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Columns3, List, LockKeyhole, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/shared/components/states';
import { cn } from '@/lib/utils';
import { AddToPortfolioDialog } from './components/add-to-portfolio-dialog';
import { NotificationBell } from './components/notification-bell';
import { OpportunitySidebar } from './components/opportunity-sidebar';
import { StageChangeDialog } from './components/portfolio-controls';
import { PortfolioItemSheet } from './components/portfolio-item-sheet';
import { PortfolioBoard, PortfolioList } from './components/portfolio-views';
import type { DemoScenario } from './notification-repository';
import {
  PORTFOLIO_STAGES,
  canEditPortfolio,
  isOfficiallyInterrupted,
  type PortfolioChange,
  type PortfolioEntry,
  type PortfolioStage,
} from './portfolio';
import { mockPortfolio, type PortfolioMutationOutcome } from './portfolio-repository';
import { usePortfolio } from './use-portfolio';

type View = 'list' | 'board';
type Tab = 'active' | 'archived';
type StageRequest = { entry: PortfolioEntry; stage: 'discarded' | 'submitted' };

const localToday = () => new Date().toLocaleDateString('sv-SE');

export default function PortfolioPage() {
  const [actorId, setActorId] = useState('ana');
  const [scenario, setScenario] = useState<DemoScenario>('success');
  const [nextOutcome, setNextOutcome] = useState<PortfolioMutationOutcome>('success');
  const [view, setView] = useState<View>('list');
  const [tab, setTab] = useState<Tab>('active');
  const [stageFilter, setStageFilter] = useState<'all' | PortfolioStage>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageRequest, setStageRequest] = useState<StageRequest | null>(null);
  const [today] = useState(localToday);
  const { state, conflict, pendingIds, reload, mutate, add, resolveConflict } = usePortfolio(mockPortfolio.repository, actorId);

  const ready = state.status === 'ready' ? state : null;
  const entries = useMemo(() => ready?.entries ?? [], [ready]);
  const members = ready?.members ?? [];
  const actor = members.find((item) => item.id === actorId);
  const canEdit = canEditPortfolio(actor);
  const active = entries.filter((entry) => !entry.archived);
  const archived = entries.filter((entry) => entry.archived);
  const interrupted = active.filter((entry) => isOfficiallyInterrupted(entry.opportunity.status));
  const overdue = active.filter((entry) => entry.internalDeadline !== null && entry.internalDeadline < today);
  const limitReached = ready ? ready.usage.used >= ready.usage.limit : false;
  const selected = entries.find((entry) => entry.id === selectedId) ?? null;

  const visible = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.archived === (tab === 'archived') &&
          (stageFilter === 'all' || entry.stage === stageFilter) &&
          (assigneeFilter === 'all' || (assigneeFilter === 'none' ? entry.assigneeId === null : entry.assigneeId === assigneeFilter)),
      ),
    [entries, tab, stageFilter, assigneeFilter],
  );

  const syncOutcome = () => setNextOutcome(mockPortfolio.demo.pendingOutcome());
  const change = async (entry: PortfolioEntry, value: PortfolioChange) => {
    await mutate(entry, value);
    syncOutcome();
  };
  const saveNote = async (entry: PortfolioEntry, text: string) => {
    const saved = await mutate(entry, { kind: 'note', text });
    syncOutcome();
    return saved;
  };
  const requestStage = (entry: PortfolioEntry, stage: PortfolioStage) => {
    if (stage === 'discarded' || stage === 'submitted') setStageRequest({ entry, stage });
    else change(entry, { kind: 'stage', stage });
  };
  const changeScenario = (value: DemoScenario) => {
    setScenario(value);
    mockPortfolio.demo.setPlanLimitReached(value === 'blocked');
    if (value === 'success' || value === 'blocked') reload();
  };
  const clearFilters = () => {
    setStageFilter('all');
    setAssigneeFilter('all');
  };

  const loading = scenario === 'loading' || state.status === 'loading';
  const failed = scenario === 'error' || state.status === 'error';

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex min-h-screen">
        <OpportunitySidebar active="portfolio" />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 lg:px-8">
          <header className="mx-auto mb-6 flex max-w-[1480px] items-center gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Minhas oportunidades</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Carteira privada da Nordeste Conecta: etapa interna, responsável, prazo e arquivamento.
              </p>
            </div>
            <NotificationBell />
          </header>

          <div className="mx-auto max-w-[1480px] space-y-4">
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed bg-card px-4 py-3">
              <span className="mr-auto text-xs font-medium text-muted-foreground">Controles da demonstração</span>
              <DemoSelect label="Visualizando como" value={actorId} onChange={setActorId} options={members.map((item) => [item.id, `${item.name} — ${item.role}`])} />
              <DemoSelect
                label="Cenário"
                value={scenario}
                onChange={(value) => changeScenario(value as DemoScenario)}
                options={[['success', 'Com dados'], ['loading', 'Carregando'], ['empty', 'Vazio'], ['error', 'Erro'], ['blocked', 'Limite do plano']]}
              />
              <DemoSelect
                label="Próxima alteração"
                value={nextOutcome}
                onChange={(value) => {
                  mockPortfolio.demo.failNextMutation(value as PortfolioMutationOutcome);
                  setNextOutcome(value as PortfolioMutationOutcome);
                }}
                options={[['success', 'Salvar normalmente'], ['error', 'Falhar (desfazer)'], ['conflict', 'Conflito de versão']]}
              />
            </div>

            {loading ? (
              <PortfolioSkeleton />
            ) : failed ? (
              <ErrorState onRetry={() => changeScenario('success')} />
            ) : ready && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Stat label="Ativas na carteira" value={scenario === 'empty' ? 0 : active.length} />
                  <Stat label="Prazos internos vencidos" value={scenario === 'empty' ? 0 : overdue.length} tone={overdue.length ? 'warning' : undefined} />
                  <Stat label="Situação oficial interrompida" value={scenario === 'empty' ? 0 : interrupted.length} tone={interrupted.length ? 'warning' : undefined} />
                  <Card className="gap-2 p-4 shadow-none">
                    <span className="flex items-center justify-between text-xs text-muted-foreground">
                      Oportunidades ativas do plano
                      <span className="font-medium text-foreground">Equipe</span>
                    </span>
                    <strong className="text-2xl text-foreground">
                      {ready.usage.used} <span className="text-sm font-normal text-muted-foreground">de {ready.usage.limit}</span>
                    </strong>
                    <Progress value={(ready.usage.used / ready.usage.limit) * 100} aria-label="Consumo da carteira do plano" />
                  </Card>
                </div>

                {limitReached && (
                  <Alert>
                    <LockKeyhole />
                    <AlertTitle>Limite de oportunidades ativas atingido</AlertTitle>
                    <AlertDescription>
                      Arquive oportunidades para liberar espaço ou conheça um plano maior. Adicionar e restaurar ficam bloqueados.
                      <Button asChild variant="link" className="h-auto p-0">
                        <Link href="/analitico/planos">Conhecer planos</Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {scenario !== 'empty' && interrupted.length > 0 && (
                  <Alert>
                    <AlertTriangle className="text-warning" />
                    <AlertTitle>{interrupted.length} oportunidade(s) com situação oficial interrompida</AlertTitle>
                    <AlertDescription>
                      {interrupted.map((entry) => entry.opportunity.title).join(' · ')}. Os dados internos foram preservados e as ações incompatíveis foram bloqueadas.
                    </AlertDescription>
                  </Alert>
                )}

                {conflict && (
                  <Alert variant="destructive" role="alert">
                    <AlertTriangle />
                    <AlertTitle>Conflito de versão</AlertTitle>
                    <AlertDescription>
                      “{conflict.entry.opportunity.title}” foi alterada por outra pessoa enquanto você editava. A versão mais recente já está na tela.
                      <span className="mt-2 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => resolveConflict(true).then(syncOutcome)}>Reaplicar minha alteração</Button>
                        <Button size="sm" variant="outline" onClick={() => resolveConflict(false)}>Manter versão atual</Button>
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                <Card className="min-w-0 gap-0 overflow-hidden py-0 shadow-sm">
                  <div className="flex flex-col gap-3 border-b p-3 xl:flex-row xl:items-end">
                    <div className="flex flex-wrap gap-1">
                      <Button variant={tab === 'active' ? 'default' : 'ghost'} className="h-9" onClick={() => setTab('active')}>
                        Ativas <span className="text-xs opacity-80">{scenario === 'empty' ? 0 : active.length}</span>
                      </Button>
                      <Button variant={tab === 'archived' ? 'default' : 'ghost'} className="h-9" onClick={() => setTab('archived')}>
                        Arquivadas <span className="text-xs opacity-80">{scenario === 'empty' ? 0 : archived.length}</span>
                      </Button>
                    </div>
                    <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:border-l xl:pl-3">
                      <label className="text-xs text-muted-foreground">
                        Etapa interna
                        <NativeSelect className="mt-1 w-full" value={stageFilter} onChange={(event) => setStageFilter(event.target.value as 'all' | PortfolioStage)}>
                          <NativeSelectOption value="all">Todas as etapas</NativeSelectOption>
                          {PORTFOLIO_STAGES.map((stage) => (
                            <NativeSelectOption key={stage.id} value={stage.id}>{stage.label}</NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </label>
                      <label className="text-xs text-muted-foreground">
                        Responsável
                        <NativeSelect className="mt-1 w-full" value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
                          <NativeSelectOption value="all">Todos</NativeSelectOption>
                          <NativeSelectOption value="none">Sem responsável</NativeSelectOption>
                          {members.map((item) => (
                            <NativeSelectOption key={item.id} value={item.id}>{item.name}</NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <Button variant="ghost" className="h-9" onClick={clearFilters}>
                        <RotateCcw />
                        Limpar
                      </Button>
                      <ViewToggle view={view} onChange={setView} />
                      {canEdit && (
                        <AddToPortfolioDialog available={scenario === 'empty' ? [] : ready.available} disabled={limitReached} onAdd={add} />
                      )}
                    </div>
                  </div>

                  {scenario === 'empty' ? (
                    <div className="p-6">
                      <EmptyState title="Sua carteira está vazia" description="Adicione oportunidades do Radar para organizar etapas, responsáveis e prazos." />
                    </div>
                  ) : !visible.length ? (
                    <div className="p-6">
                      <EmptyState
                        title={tab === 'archived' ? 'Nenhuma oportunidade arquivada neste recorte' : 'Nenhuma oportunidade neste recorte'}
                        description="Ajuste a etapa ou o responsável para ver outras oportunidades."
                        onReset={clearFilters}
                      />
                    </div>
                  ) : view === 'list' ? (
                    <PortfolioList entries={visible} members={members} canEdit={canEdit} pendingIds={pendingIds} today={today} onOpen={(entry) => setSelectedId(entry.id)} onStageRequest={requestStage} />
                  ) : (
                    <PortfolioBoard entries={visible} members={members} canEdit={canEdit} pendingIds={pendingIds} today={today} onOpen={(entry) => setSelectedId(entry.id)} onStageRequest={requestStage} />
                  )}
                </Card>
              </>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Ambiente demonstrativo · fixture company-demo-nordeste · alterações mantidas nesta sessão, sem integração real
            </p>
          </div>

          <PortfolioItemSheet
            entry={scenario === 'success' || scenario === 'blocked' ? selected : null}
            members={members}
            actor={actor}
            canEdit={canEdit}
            pending={selected ? pendingIds.has(selected.id) : false}
            onClose={() => setSelectedId(null)}
            onChange={change}
            onNoteSave={saveNote}
            onStageRequest={requestStage}
          />
          <StageChangeDialog
            request={stageRequest}
            onCancel={() => setStageRequest(null)}
            onConfirm={(data) => {
              if (stageRequest) change(stageRequest.entry, { kind: 'stage', stage: stageRequest.stage, ...data });
              setStageRequest(null);
            }}
          />
        </main>
      </div>
    </div>
  );
}

function DemoSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return (
    <label className="text-xs text-muted-foreground">
      {label}
      <NativeSelect size="sm" className="mt-1 w-48" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([key, text]) => (
          <NativeSelectOption key={key} value={key}>{text}</NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}

function ViewToggle({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  return (
    <div className="flex rounded-lg border p-0.5" role="group" aria-label="Visualização">
      <Button size="sm" variant={view === 'list' ? 'secondary' : 'ghost'} aria-pressed={view === 'list'} onClick={() => onChange('list')}>
        <List />
        Lista
      </Button>
      <Button size="sm" variant={view === 'board' ? 'secondary' : 'ghost'} aria-pressed={view === 'board'} onClick={() => onChange('board')}>
        <Columns3 />
        Quadro
      </Button>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'warning' }) {
  return (
    <Card className="gap-1 p-4 shadow-none">
      <span className="text-xs text-muted-foreground">{label}</span>
      <strong className={cn('text-2xl text-foreground', tone === 'warning' && 'text-warning')}>{value}</strong>
    </Card>
  );
}

function PortfolioSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando carteira" className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
