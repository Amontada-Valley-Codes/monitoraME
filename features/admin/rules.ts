import type {
  AdminActivity,
  AdminCompany,
  AdminOverview,
  AdminRole,
  CompanyAccessChange,
  CompanyAccessStatus,
  CompanySize,
} from './types';

export class AdminRuleError extends Error {}

export const SUSPENSION_REASON_MIN = 10;

export const accessStatusLabel: Record<CompanyAccessStatus, string> = {
  pending: 'Pendente',
  active: 'Ativa',
  suspended: 'Suspensa',
  rejected: 'Rejeitada',
};

export const companySizeLabel: Record<CompanySize, string> = {
  mei: 'MEI',
  me: 'ME',
  epp: 'EPP',
  other: 'Demais portes',
};

/** Cookie lido somente em desenvolvimento para alternar o perfil da sessão demonstrativa. */
export const ADMIN_DEMO_ROLE_COOKIE = 'monitorame_demo_admin_role';
export const ADMIN_DEMO_PROFILES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'monitor', label: 'Monitor (somente leitura)' },
  { value: 'company', label: 'Empresa (sem acesso)' },
] as const;

/** Reflete a regra na interface. A autorização definitiva é sempre do backend. */
export const canManageCompanies = (role: AdminRole | null) => role === 'admin';

export function parseAdminRole(value: string | null | undefined): AdminRole | null {
  const role = value?.trim().toLowerCase();
  return role === 'admin' || role === 'monitor' ? role : null;
}

export const formatCnpj = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 14 ? digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : value;
};

/** Valida e aplica a mudança de situação de acesso, registrando autor e motivo no histórico. */
export function applyCompanyAccessChange(
  company: AdminCompany,
  change: CompanyAccessChange,
  authorName: string,
  at = new Date().toISOString(),
): AdminCompany {
  let status: CompanyAccessStatus;
  let reason: string | undefined;

  if (change.kind === 'suspend') {
    if (company.access_status !== 'active') throw new AdminRuleError('Somente empresas ativas podem ser suspensas.');
    reason = change.reason.trim();
    if (reason.length < SUSPENSION_REASON_MIN) {
      throw new AdminRuleError(`Informe o motivo da suspensão (mínimo de ${SUSPENSION_REASON_MIN} caracteres).`);
    }
    status = 'suspended';
  } else {
    if (company.access_status !== 'suspended') throw new AdminRuleError('Somente empresas suspensas podem ser reativadas.');
    status = 'active';
  }

  return {
    ...company,
    access_status: status,
    updated_at: at,
    version: company.version + 1,
    status_history: [
      { id: `${company.id}-v${company.version + 1}`, status, occurred_at: at, author_name: authorName, reason },
      ...company.status_history,
    ],
  };
}

export function buildAdminOverview(companies: AdminCompany[], activity: AdminActivity[], generatedAt: string): AdminOverview {
  const byStatus: Record<CompanyAccessStatus, number> = { pending: 0, active: 0, suspended: 0, rejected: 0 };
  const bySize: Record<CompanySize, number> = { mei: 0, me: 0, epp: 0, other: 0 };
  const byMunicipality = new Map<string, { municipality: AdminCompany['municipality']; total: number }>();

  companies.forEach((company) => {
    byStatus[company.access_status] += 1;
    if (company.access_status !== 'active') return;
    bySize[company.company_size] += 1;
    const key = `${company.municipality.ibge_code}-${company.municipality.uf}`;
    const current = byMunicipality.get(key) ?? { municipality: company.municipality, total: 0 };
    byMunicipality.set(key, { ...current, total: current.total + 1 });
  });

  return {
    generated_at: generatedAt,
    companies_by_status: byStatus,
    companies_by_size: bySize,
    top_municipalities: [...byMunicipality.values()].sort((a, b) => b.total - a.total || a.municipality.name.localeCompare(b.municipality.name, 'pt-BR')).slice(0, 5),
    pending_requests: companies
      .filter((company) => company.access_status === 'pending' && company.access_request)
      .map((company) => ({
        company_id: company.id,
        legal_name: company.legal_name,
        protocol: company.access_request!.protocol,
        submitted_at: company.access_request!.submitted_at,
        documents_count: company.access_request!.documents_count,
      }))
      .sort((a, b) => a.submitted_at.localeCompare(b.submitted_at)),
    recent_activity: [...activity].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)).slice(0, 6),
  };
}
