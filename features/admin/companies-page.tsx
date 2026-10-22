'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Eye, FileText, Loader2, MoreVertical, RefreshCw, ShieldCheck, ShieldOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { DataTable, type Column } from '@/shared/components/data-table';
import { EmptyState, ErrorState } from '@/shared/components/states';
import { cn } from '@/lib/utils';
import { adminDemoControls, mockAdminRepository } from './admin-repository';
import { useAdminSession } from './admin-session';
import { CompanyAccessDialog, type AccessRequest } from './components/company-access-dialog';
import { AccessStatusBadge, CompanyDetailsSheet } from './components/company-details-sheet';
import { AdminPageHeader, AdminPageSkeleton } from './components/admin-states';
import { accessStatusLabel, canManageCompanies, companySizeLabel, formatCnpj } from './rules';
import type { AdminCompany, CompanyAccessStatus } from './types';
import { useAdminCompanies } from './use-admin-companies';

type Filter = 'all' | CompanyAccessStatus;
type Scenario = 'success' | 'loading' | 'empty' | 'error' | 'failure';
const FILTERS: Filter[] = ['all', 'pending', 'active', 'suspended', 'rejected'];
const FILTER_LABELS: Record<Filter, string> = { all: 'Todas', pending: 'Pendentes', active: 'Ativas', suspended: 'Suspensas', rejected: 'Rejeitadas' };
const isFilter = (value: string | null): value is Filter => FILTERS.includes(value as Filter);

export default function AdminCompaniesPage() {
  const { role, demo } = useAdminSession();
  const canManage = canManageCompanies(role);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('situacao');
  const filter: Filter = isFilter(filterParam) ? filterParam : 'all';

  const { state, pendingId, reload, changeAccess } = useAdminCompanies(mockAdminRepository, demo ? 'Administrador (demonstração)' : 'Administrador');
  const [scenario, setScenario] = useState<Scenario>('success');
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null);

  const companies = useMemo(
    () => (state.status === 'ready' && scenario !== 'empty' ? state.companies : []),
    [state, scenario],
  );
  const counts = useMemo(() => {
    const result: Record<Filter, number> = { all: companies.length, pending: 0, active: 0, suspended: 0, rejected: 0 };
    companies.forEach((company) => { result[company.access_status] += 1; });
    return result;
  }, [companies]);
  const rows = filter === 'all' ? companies : companies.filter((company) => company.access_status === filter);
  const details = companies.find((company) => company.id === detailsId) ?? null;

  const setFilter = (value: Filter) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') params.delete('situacao'); else params.set('situacao', value);
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };
  const changeScenario = (value: Scenario) => {
    setScenario(value);
    adminDemoControls.failNextChange = value === 'failure';
  };
  const confirmAccess: (change: Parameters<typeof changeAccess>[1]) => Promise<void> = async (change) => {
    if (!accessRequest) return;
    const done = await changeAccess(accessRequest.company, change);
    if (done) setAccessRequest(null);
    if (scenario === 'failure') setScenario('success');
  };

  const columns: Column<AdminCompany>[] = [
    {
      key: 'company',
      label: 'Empresa',
      get: (company) => `${company.legal_name} ${company.trade_name ?? ''}`,
      render: (company) => (
        <span className="block min-w-48 max-w-80">
          <span className="block truncate font-semibold">{company.legal_name}</span>
          {company.trade_name && <span className="block truncate text-xs text-muted-foreground">{company.trade_name}</span>}
        </span>
      ),
    },
    { key: 'cnpj', label: 'CNPJ', get: (company) => formatCnpj(company.cnpj), render: (company) => <span className="whitespace-nowrap tabular-nums">{formatCnpj(company.cnpj)}</span> },
    { key: 'size', label: 'Porte', get: (company) => companySizeLabel[company.company_size], render: (company) => <Badge variant="outline">{companySizeLabel[company.company_size]}</Badge> },
    { key: 'municipality', label: 'Município', get: (company) => `${company.municipality.name}/${company.municipality.uf}` },
    { key: 'status', label: 'Situação', get: (company) => accessStatusLabel[company.access_status], render: (company) => <AccessStatusBadge status={company.access_status} /> },
    {
      key: 'actions',
      label: 'Ações',
      align: 'right',
      get: () => '',
      render: (company) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={pendingId === company.id} aria-label={`Ações para ${company.legal_name}`}>
              {pendingId === company.id ? <Loader2 className="animate-spin" /> : <MoreVertical />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDetailsId(company.id)}>
              <Eye />
              Ver detalhes
            </DropdownMenuItem>
            {company.access_request && (
              <DropdownMenuItem onSelect={() => router.push(`/access-requests/${company.access_request!.protocol}`)}>
                <FileText />
                Ver solicitação
              </DropdownMenuItem>
            )}
            {canManage && company.access_status === 'active' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setAccessRequest({ company, kind: 'suspend' })}>
                  <ShieldOff />
                  Suspender acesso
                </DropdownMenuItem>
              </>
            )}
            {canManage && company.access_status === 'suspended' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setAccessRequest({ company, kind: 'reactivate' })}>
                  <ShieldCheck />
                  Reativar acesso
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1480px]">
      <AdminPageHeader title="Empresas" description="Empresas cadastradas e situação de acesso à plataforma.">
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-muted-foreground">
            Cenário
            <NativeSelect className="mt-1 h-9 w-52" value={scenario} onChange={(event) => changeScenario(event.target.value as Scenario)}>
              <NativeSelectOption value="success">Com dados</NativeSelectOption>
              <NativeSelectOption value="loading">Carregando</NativeSelectOption>
              <NativeSelectOption value="empty">Vazio</NativeSelectOption>
              <NativeSelectOption value="error">Erro ao carregar</NativeSelectOption>
              <NativeSelectOption value="failure">Falha na próxima operação</NativeSelectOption>
            </NativeSelect>
          </label>
          <Button variant="outline" className="h-9 min-h-9!" disabled={state.status === 'loading'} onClick={reload}>
            <RefreshCw className={cn(state.status === 'loading' && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </AdminPageHeader>

      {!canManage && (
        <p className="mb-4 rounded-lg border bg-card p-3 text-xs text-muted-foreground">
          Perfil Monitor: consulta liberada; suspender e reativar acesso são exclusivos de administradores.
        </p>
      )}

      {scenario === 'loading' || state.status === 'loading' ? (
        <AdminPageSkeleton label="Carregando empresas" />
      ) : scenario === 'error' || state.status === 'error' ? (
        <ErrorState onRetry={() => { setScenario('success'); reload(); }} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar por situação">
            {FILTERS.map((value) => (
              <Button key={value} variant={filter === value ? 'default' : 'outline'} className="h-9 min-h-9!" aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {FILTER_LABELS[value]}
                <span className="text-xs opacity-80">{counts[value]}</span>
              </Button>
            ))}
          </div>

          {companies.length ? (
            <DataTable
              key={filter}
              title={filter === 'all' ? 'Todas as empresas' : `Empresas com situação “${accessStatusLabel[filter]}”`}
              rows={rows}
              columns={columns}
              searchPlaceholder="Buscar empresa, CNPJ ou município"
              pageSize={8}
            />
          ) : (
            <div className="rounded-xl border bg-card p-6">
              <EmptyState title="Nenhuma empresa cadastrada" description="As empresas aparecerão aqui assim que enviarem a solicitação de acesso." />
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Ambiente demonstrativo · empresas e CNPJs fictícios · alterações mantidas nesta sessão do navegador
          </p>
        </div>
      )}

      <CompanyDetailsSheet company={details} onClose={() => setDetailsId(null)} />
      <CompanyAccessDialog
        key={accessRequest ? `${accessRequest.company.id}-${accessRequest.kind}` : 'closed'}
        request={accessRequest}
        pending={accessRequest !== null && pendingId === accessRequest.company.id}
        onCancel={() => setAccessRequest(null)}
        onConfirm={confirmAccess}
      />
    </div>
  );
}
