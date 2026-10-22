'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CircleCheck,
  CircleSlash,
  Clock3,
  FileClock,
  MapPin,
  Radar,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { EmptyState, ErrorState } from '@/shared/components/states';
import { cn } from '@/lib/utils';
import { mockAdminRepository } from './admin-repository';
import { useAdminSession } from './admin-session';
import { AdminPageHeader, AdminPageSkeleton } from './components/admin-states';
import { buildAdminOverview, companySizeLabel } from './rules';
import type { CompanySize } from './types';
import { useAdminOverview } from './use-admin-overview';

type Scenario = 'success' | 'loading' | 'empty' | 'error';

const DAY = 86400000;
const REVIEW_SLA_DAYS = 2;
const dateTime = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export default function AdminDashboardPage() {
  const { role } = useAdminSession();
  const { state, reload } = useAdminOverview(mockAdminRepository);
  const [scenario, setScenario] = useState<Scenario>('success');

  const ready = state.status === 'ready' ? state : null;
  const overview = ready && scenario === 'empty' ? buildAdminOverview([], [], ready.overview.generated_at) : ready?.overview;

  return (
    <div className="mx-auto max-w-[1480px]">
      <AdminPageHeader title="Painel administrativo" description="Pendências e situação geral das empresas da plataforma.">
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-muted-foreground">
            Cenário
            <NativeSelect className="mt-1 h-9 w-40" value={scenario} onChange={(event) => setScenario(event.target.value as Scenario)}>
              <NativeSelectOption value="success">Com dados</NativeSelectOption>
              <NativeSelectOption value="loading">Carregando</NativeSelectOption>
              <NativeSelectOption value="empty">Vazio</NativeSelectOption>
              <NativeSelectOption value="error">Erro</NativeSelectOption>
            </NativeSelect>
          </label>
          <Button variant="outline" className="h-9 min-h-9!" disabled={state.status === 'loading'} onClick={reload}>
            <RefreshCw className={cn(state.status === 'loading' && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </AdminPageHeader>

      {scenario === 'loading' || state.status === 'loading' ? (
        <AdminPageSkeleton label="Carregando indicadores administrativos" />
      ) : scenario === 'error' || state.status === 'error' || !overview || !ready ? (
        <ErrorState onRetry={() => { setScenario('success'); reload(); }} />
      ) : (
        <div className="space-y-4">
          <section aria-label="Resumo das empresas por situação" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Solicitações pendentes" value={overview.companies_by_status.pending} icon={FileClock} tone="warning" href="/admin/empresas?situacao=pending" detail="Aguardando análise documental" />
            <StatCard label="Empresas ativas" value={overview.companies_by_status.active} icon={CircleCheck} tone="success" href="/admin/empresas?situacao=active" detail="Com acesso liberado" />
            <StatCard label="Empresas suspensas" value={overview.companies_by_status.suspended} icon={CircleSlash} tone="destructive" href="/admin/empresas?situacao=suspended" detail="Acesso bloqueado pela administração" />
            <StatCard label="Rejeitadas" value={overview.companies_by_status.rejected} icon={Building2} href="/admin/empresas?situacao=rejected" detail="Solicitações não aprovadas" />
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
            <Panel title="Solicitações aguardando análise" icon={Clock3} description={`Mais antigas primeiro · prazo de referência de ${REVIEW_SLA_DAYS} dias`}>
              {overview.pending_requests.length ? (
                <ul className="divide-y">
                  {overview.pending_requests.map((request) => {
                    const waiting = Math.max(0, Math.floor((ready.loadedAt - new Date(request.submitted_at).getTime()) / DAY));
                    const late = waiting > REVIEW_SLA_DAYS;
                    return (
                      <li key={request.protocol} className="flex flex-wrap items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{request.legal_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.protocol} · enviada em {dateTime(request.submitted_at)} · {request.documents_count} documento(s)
                          </p>
                        </div>
                        <Badge variant="secondary" className={cn(late && 'bg-warning-soft text-warning')}>
                          {waiting === 0 ? 'Hoje' : `Há ${waiting} dia${waiting > 1 ? 's' : ''}`}
                          {late && ' · acima do prazo'}
                        </Badge>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/access-requests/${request.protocol}`}>Ver solicitação</Link>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState title="Nenhuma solicitação pendente" description="Novas solicitações de acesso aparecerão aqui." />
              )}
            </Panel>

            <Panel title="Atalhos" icon={Radar} description={role === 'monitor' ? 'Perfil Monitor: acesso somente leitura.' : 'Acesso rápido às rotinas administrativas.'}>
              <nav aria-label="Atalhos administrativos" className="grid gap-2">
                {[
                  { href: '/admin/empresas', label: 'Gerenciar empresas', description: 'Consultar, suspender e reativar acessos', icon: Building2 },
                  ...(overview.pending_requests[0]
                    ? [{ href: `/access-requests/${overview.pending_requests[0].protocol}`, label: 'Revisar solicitação mais antiga', description: overview.pending_requests[0].legal_name, icon: FileClock }]
                    : []),
                  { href: '/analitico', label: 'Painel analítico', description: 'Indicadores de compras públicas do Ceará', icon: BarChart3 },
                  { href: '/oportunidades', label: 'Oportunidades', description: 'Radar de editais do PNCP', icon: Radar },
                  { href: '/oportunidades/notificacoes', label: 'Central de notificações', description: 'Alertas da operação', icon: Bell },
                ].map(({ href, label, description, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 rounded-lg border p-3 transition hover:border-primary/40 hover:bg-muted/40">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Icon className="size-4" /></span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{description}</span>
                    </span>
                  </Link>
                ))}
              </nav>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <Panel title="Empresas ativas por porte" icon={Building2}>
              <Bars
                rows={(Object.keys(overview.companies_by_size) as CompanySize[]).map((size) => ({ label: companySizeLabel[size], value: overview.companies_by_size[size] }))}
                empty="Nenhuma empresa ativa."
              />
            </Panel>
            <Panel title="Municípios com mais empresas ativas" icon={MapPin}>
              <Bars
                rows={overview.top_municipalities.map((item) => ({ label: `${item.municipality.name}/${item.municipality.uf}`, value: item.total }))}
                empty="Nenhuma empresa ativa."
              />
            </Panel>
            <Panel title="Atividade administrativa recente" icon={Activity} className="lg:col-span-2 xl:col-span-1">
              {overview.recent_activity.length ? (
                <ol className="space-y-3">
                  {overview.recent_activity.map((item) => (
                    <li key={item.id} className="text-sm">
                      <p><b className="font-semibold">{item.author_name}</b> · {item.description}</p>
                      <time className="text-xs text-muted-foreground" dateTime={item.occurred_at}>{dateTime(item.occurred_at)}</time>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
              )}
            </Panel>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Dados gerados em {dateTime(overview.generated_at)} · ambiente demonstrativo com empresas fictícias · consulta privada, sem cache compartilhado
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone, href }: { label: string; value: number; detail: string; icon: LucideIcon; tone?: 'warning' | 'success' | 'destructive'; href?: string }) {
  const content = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-md border bg-muted/50 text-muted-foreground',
            tone === 'warning' && 'border-warning/30 bg-warning-soft text-warning',
            tone === 'success' && 'border-success/30 bg-success-soft text-success',
            tone === 'destructive' && 'border-destructive/30 bg-destructive/10 text-destructive',
          )}
        >
          <Icon className="size-4" />
        </span>
      </span>
      <strong className="metric mt-3 block text-3xl text-foreground">{value.toLocaleString('pt-BR')}</strong>
      <span className="mt-1 block text-xs text-muted-foreground">{detail}</span>
    </>
  );
  return href ? (
    <Link href={href} className="rounded-xl border bg-card p-5 transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      {content}
    </Link>
  ) : (
    <Card className="gap-0 p-5 shadow-none">{content}</Card>
  );
}

function Panel({ title, description, icon: Icon, className, children }: { title: string; description?: string; icon: LucideIcon; className?: string; children: ReactNode }) {
  return (
    <Card className={cn('gap-0 p-5 shadow-sm', className)}>
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        {title}
      </h2>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function Bars({ rows, empty }: { rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(0, ...rows.map((row) => row.value));
  if (!max) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label} className="text-sm">
          <span className="flex justify-between gap-3">
            <span>{row.label}</span>
            <span className="font-semibold tabular-nums">{row.value}</span>
          </span>
          <span className="mt-1 block h-2 rounded-full bg-muted" aria-hidden>
            <span className="block h-2 rounded-full bg-primary" style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
