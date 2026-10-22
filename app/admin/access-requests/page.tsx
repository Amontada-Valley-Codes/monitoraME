'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  RefreshCw,
  Scale,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { AccessRequestActions } from '@/features/admin/access-requests/components/access-request-actions';
import {
  fetchAdminAccessRequests,
  getAccessRequestErrorMessage,
} from '@/features/admin/access-requests/access-requests.service';
import type {
  AdminAccessRequest,
  AdminAccessRequestStatus,
} from '@/features/admin/access-requests/types';
import { Logo } from '@/shared/components/logo';

// Fixture explícita para demonstração quando a API local não estiver ativa
const DEMO_ACCESS_REQUESTS: AdminAccessRequest[] = [
  {
    id: 'req-01',
    protocol: 'REQ-2026-88A9F',
    company_name: 'MONITORA ME TECNOLOGIA LTDA',
    trade_name: 'MonitoraME',
    cnpj: '12.345.678/0001-99',
    company_size: 'ME',
    municipality_name: 'Fortaleza',
    uf: 'CE',
    applicant_name: 'Sara de Sousa Magalhães',
    applicant_email: 'contato@monitorame.com.br',
    status: 'pending',
    submitted_at: '2026-10-20T14:30:00.000Z',
  },
  {
    id: 'req-02',
    protocol: 'REQ-2026-91B2C',
    company_name: 'SOLUCOES DIGITAIS DO SERTAO LTDA',
    trade_name: 'Sertão Digital',
    cnpj: '98.765.432/0001-10',
    company_size: 'EPP',
    municipality_name: 'Sobral',
    uf: 'CE',
    applicant_name: 'Carlos Eduardo Lima',
    applicant_email: 'carlos@sertaodigital.com.br',
    status: 'under_review',
    submitted_at: '2026-10-21T09:15:00.000Z',
  },
];

// Escopo de superfície clara (mesma técnica de features/landing/landing.css)
// Evita que o fundo da tela fique totalmente azul-escuro (#071a3b) ou azulado lavado (#f2f6fc)
const PAGE_SURFACE_VARS = {
  '--background': '#f8fafc',
  '--card': '#ffffff',
  '--card-foreground': '#102c55',
  '--foreground': '#102c55',
  '--muted': '#f1f5f9',
  '--muted-foreground': '#64748b',
  '--border': '#e2e8f0',
  '--primary': '#1560bd',
  '--primary-foreground': '#ffffff',
  colorScheme: 'light',
} as React.CSSProperties;

const STATUS_BADGE: Record<
  AdminAccessRequestStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: 'Aguardando análise',
    className: 'border-[#fde68a] bg-[#fffbeb] text-[#b45309]',
    dotClassName: 'bg-[#f59e0b]',
    icon: Clock,
  },
  under_review: {
    label: 'Em análise',
    className: 'border-[#bfdbfe] bg-[#eff6ff] text-[#1560bd]',
    dotClassName: 'bg-[#1560bd]',
    icon: Clock,
  },
  approved: {
    label: 'Aprovado',
    className: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
    dotClassName: 'bg-[#16a34a]',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Recusado',
    className: 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]',
    dotClassName: 'bg-[#dc2626]',
    icon: XCircle,
  },
};

export default function AdminAccessRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = React.useState<AdminAccessRequest[]>(DEMO_ACCESS_REQUESTS);
  const [isDemoData, setIsDemoData] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadRequests = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAccessRequests('pending');
      setRequests(data);
      setIsDemoData(false);
      toast.success('Fila sincronizada com sucesso.');
    } catch (error) {
      toast.error(
        getAccessRequestErrorMessage(
          error,
          'Não foi possível sincronizar com o servidor. Exibindo dados de demonstração.',
        ),
      );
      setIsDemoData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleStatusUpdated(
    requestId: string,
    newStatus: 'approved' | 'rejected',
    reviewComment?: string,
  ) {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? {
              ...item,
              status: newStatus,
              review_comment: reviewComment ?? item.review_comment,
              reviewed_at: new Date().toISOString(),
            }
          : item,
      ),
    );
    router.refresh();
  }

  const pendingCount = requests.filter(
    (r) => r.status === 'pending' || r.status === 'under_review',
  ).length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div
      style={PAGE_SURFACE_VARS}
      className="min-h-svh bg-[#f8fafc] pb-20 text-[#102c55]"
    >
      {/* Header limpo em branco puro com a marca oficial MonitoraME */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#e2e8f0] bg-[#ffffff]/95 px-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="MonitoraME início" className="flex items-center text-[#102c55]">
              <Logo className="h-6 w-auto" />
            </Link>
            <span className="h-5 w-px bg-[#e2e8f0]" aria-hidden="true" />
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <span className="hidden text-[#64748b] sm:block">Administração</span>
              <ChevronRight className="hidden size-3.5 text-[#94a3b8] sm:block" />
              <span className="truncate font-semibold text-[#102c55]">
                Solicitações de acesso
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadRequests}
              disabled={isLoading}
              className="h-9 border-[#cbd5e1] bg-[#ffffff] text-xs font-semibold text-[#334155] hover:bg-[#f1f5f9] hover:text-[#102c55]"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar fila</span>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-9 text-xs font-medium text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#102c55]"
            >
              <Link href="/analitico">
                <ArrowLeft className="size-3.5" />
                <span className="hidden sm:inline">Painel analítico</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-8 sm:px-8">
        {/* Banner Hero na paleta de login-view.tsx & landing-page.tsx (#102c55 + #2058b7 + #b8d4ff) */}
        <section className="relative overflow-hidden rounded-3xl bg-[#102c55] p-7 text-white shadow-[0_24px_60px_-28px_rgb(16_44_85/45%)] sm:p-9">
          <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full border-[2.5rem] border-white/5" />
          <div className="pointer-events-none absolute -bottom-28 right-40 size-64 rounded-full bg-[#2058b7]/35 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#b8d4ff] uppercase">
                <span className="size-1.5 rounded-full bg-[#f7931e]" />
                Governança e Credenciamento MPE
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                Aprovação e rejeição de{' '}
                <span className="text-[#b8d4ff]">solicitações de acesso</span>.
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm leading-6 text-white/72">
                Valide a regularidade cadastral e os documentos comprobatórios enviados pelas
                empresas antes de liberar o acesso aos recursos restritos da plataforma.
              </p>
            </div>

            {isDemoData && (
              <div className="flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-xs lg:self-auto">
                <ShieldCheck className="size-4 text-[#b8d4ff]" />
                <span>Ambiente de demonstração</span>
              </div>
            )}
          </div>

          {/* KPIs integrados sobre cartões brancos nítidos */}
          <div className="relative z-10 mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-xs">
              <span className="font-mono text-[10px] tracking-[0.12em] text-white/65 uppercase">
                Pendentes de deliberação
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="metric text-3xl font-bold text-white">{pendingCount}</span>
                <span className="rounded-full bg-[#f7931e]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#ffcc67]">
                  Fila ativa
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-xs">
              <span className="font-mono text-[10px] tracking-[0.12em] text-white/65 uppercase">
                Solicitações aprovadas
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="metric text-3xl font-bold text-[#8ddb80]">{approvedCount}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80">
                  Acesso liberado
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-xs">
              <span className="font-mono text-[10px] tracking-[0.12em] text-white/65 uppercase">
                Solicitações rejeitadas
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="metric text-3xl font-bold text-[#ffb4ab]">{rejectedCount}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80">
                  Com parecer
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Área de conteúdo sobre fundo neutro claro (#f8fafc) com cartões brancos puros (#ffffff) */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section
            aria-labelledby="requests-title"
            className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#ffffff] shadow-[0_12px_35px_-28px_rgb(16_44_85/25%)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] bg-[#f8fafc] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1560bd]">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-[#1560bd] uppercase">
                    Fila de credenciamento
                  </p>
                  <h2 id="requests-title" className="text-base font-bold text-[#102c55]">
                    Empresas aguardando deliberação
                  </h2>
                </div>
              </div>
              <span className="rounded-full border border-[#e2e8f0] bg-[#ffffff] px-3 py-1 font-mono text-xs font-medium text-[#64748b]">
                {requests.length} {requests.length === 1 ? 'protocolo' : 'protocolos'}
              </span>
            </div>

            {requests.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#64748b]">
                Nenhuma solicitação de acesso pendente no momento.
              </div>
            ) : (
              <div className="divide-y divide-[#e2e8f0]">
                {requests.map((req) => {
                  const statusMeta = STATUS_BADGE[req.status];
                  const locationLabel = `${req.company_size} · ${req.municipality_name}/${req.uf}`;
                  const facts: Array<[string, string]> = [
                    ['CNPJ', req.cnpj],
                    ['Nome fantasia', req.trade_name || 'Não informado'],
                    ['Porte empresarial', req.company_size],
                    ['Município / UF', `${req.municipality_name} / ${req.uf}`],
                    ['Representante legal', req.applicant_name],
                    ['E-mail de notificação', req.applicant_email],
                  ];

                  return (
                    <article
                      key={req.id}
                      className="p-6 transition-colors hover:bg-[#f8fafc]/80"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="data-value rounded border border-[#dbeafe] bg-[#eff6ff] px-2 py-0.5 font-mono text-xs font-semibold text-[#1560bd]">
                              {req.protocol}
                            </span>
                            <span className="text-xs text-[#64748b]">
                              · Enviado em{' '}
                              {new Date(req.submitted_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <h3 className="mt-2 text-lg font-bold text-[#102c55]">
                            {req.company_name}
                          </h3>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${statusMeta.dotClassName}`}
                            aria-hidden="true"
                          />
                          {statusMeta.label}
                        </span>
                      </div>

                      {/* Grade de metadados cadastrais com barra lateral azul suave */}
                      <dl className="mt-5 grid gap-x-8 gap-y-4 rounded-xl border border-[#f1f5f9] bg-[#f8fafc] p-4 sm:grid-cols-2 xl:grid-cols-3">
                        {facts.map(([label, value]) => (
                          <div key={label} className="border-l-2 border-[#cbd5e1] pl-3">
                            <dt className="text-xs text-[#64748b]">{label}</dt>
                            <dd className="mt-0.5 truncate text-sm font-semibold text-[#102c55]">
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      {req.status === 'rejected' && req.review_comment && (
                        <div className="mt-4 rounded-r-xl border border-[#fecaca] border-l-4 border-l-[#dc2626] bg-[#fef2f2] p-3.5">
                          <span className="block font-mono text-[10px] font-bold tracking-wider text-[#dc2626] uppercase">
                            Parecer de rejeição registado
                          </span>
                          <p className="mt-1 text-xs text-[#7f1d1d]">{req.review_comment}</p>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748b]">
                          <span className="inline-flex items-center gap-1.5">
                            <FileText className="size-3.5 text-[#1560bd]" />
                            Contrato Social, Cartão CNPJ e Identificação anexados
                          </span>
                          <Link
                            href={`/access-requests/${req.protocol}`}
                            className="inline-flex items-center gap-1 font-semibold text-[#1560bd] hover:underline"
                          >
                            Ver protocolo <ArrowUpRight className="size-3.5" />
                          </Link>
                        </div>

                        <AccessRequestActions
                          requestId={req.id}
                          companyName={req.company_name}
                          cnpj={req.cnpj}
                          protocol={req.protocol}
                          locationLabel={locationLabel}
                          status={req.status}
                          onStatusUpdated={handleStatusUpdated}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Coluna Lateral */}
          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-[0_12px_35px_-28px_rgb(16_44_85/25%)]">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1560bd]">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-[#1560bd] uppercase">
                    Conformidade
                  </p>
                  <h2 className="text-base font-bold text-[#102c55]">Critérios de aprovação</h2>
                </div>
              </div>

              <ul className="mt-5 space-y-3.5 text-xs leading-relaxed text-[#64748b]">
                <li className="border-l-2 border-[#1560bd] pl-3">
                  <strong className="block text-[#102c55]">Situação Cadastral Ativa</strong>
                  CNPJ regular na Receita Federal e enquadramento compatível (MEI, ME ou EPP).
                </li>
                <li className="border-l-2 border-[#1560bd] pl-3">
                  <strong className="block text-[#102c55]">Vínculo Societário</strong>
                  Representante legal validado no Contrato Social, Requerimento ou Procuração.
                </li>
                <li className="border-l-2 border-[#1560bd] pl-3">
                  <strong className="block text-[#102c55]">Legibilidade dos Anexos</strong>
                  Documentos íntegros e dentro do prazo de validade aplicável.
                </li>
              </ul>

              <div className="mt-6 rounded-xl border border-[#dbeafe] bg-[#f8fbff] p-4">
                <div className="flex items-start gap-2.5">
                  <Scale className="mt-0.5 size-4 shrink-0 text-[#1560bd]" />
                  <div className="text-xs">
                    <p className="font-bold text-[#102c55]">Art. 48 · LC 123/2006</p>
                    <p className="mt-1 leading-relaxed text-[#475569]">
                      O correto enquadramento assegura alertas precisos para cotas exclusivas e
                      dispensas de até R$ 80 mil.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
