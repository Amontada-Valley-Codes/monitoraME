import { adminDemoFixture } from './demo-fixture';
import { AdminRuleError, applyCompanyAccessChange, buildAdminOverview } from './rules';
import type { AdminActivity, AdminCompany, AdminOverview, CompanyAccessChange } from './types';

/**
 * Contrato usado pelo painel. Dados administrativos são privados: a implementação real deve
 * consultar a API com `cache: 'no-store'` e `credentials: 'include'`, sem cache compartilhado.
 */
export interface AdminRepository {
  getOverview(signal?: AbortSignal): Promise<AdminOverview>;
  listCompanies(signal?: AbortSignal): Promise<AdminCompany[]>;
  /** Operação sensível: o backend valida o perfil e a versão antes de aplicar. */
  changeCompanyAccess(id: string, expectedVersion: number, change: CompanyAccessChange, authorName: string): Promise<AdminCompany>;
}

export class AdminConflictError extends Error {
  constructor(public latest: AdminCompany) {
    super('A situação desta empresa foi alterada por outra pessoa. Exibimos a versão mais recente.');
  }
}

export const ADMIN_DEMO_STORAGE_KEY = 'monitorame:demo-admin';
export type AdminDemoState = { companies: AdminCompany[]; activity: AdminActivity[] };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const pause = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;

/** Estado da demonstração: fixture + alterações feitas nesta sessão do navegador. */
export function createAdminDemoStore(storage: Storage | null) {
  const initial = (): AdminDemoState => clone({ companies: adminDemoFixture.companies, activity: adminDemoFixture.activity }) as AdminDemoState;
  return {
    read(): AdminDemoState {
      try {
        const raw = storage?.getItem(ADMIN_DEMO_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AdminDemoState) : initial();
      } catch {
        return initial();
      }
    },
    write(state: AdminDemoState) {
      try { storage?.setItem(ADMIN_DEMO_STORAGE_KEY, JSON.stringify(state)); } catch { /* estado mantido apenas em memória */ }
    },
  };
}

/** Controle exclusivo da demonstração: faz a próxima operação sensível falhar. */
export const adminDemoControls = { failNextChange: false };

export function createMockAdminRepository({ latency = 400, storage = null }: { latency?: number; storage?: Storage | null } = {}): AdminRepository {
  const store = createAdminDemoStore(storage);
  return {
    async changeCompanyAccess(id, expectedVersion, change, authorName) {
      await pause(latency);
      if (adminDemoControls.failNextChange) {
        adminDemoControls.failNextChange = false;
        throw new Error('Falha simulada ao salvar.');
      }
      const state = store.read();
      const current = state.companies.find((company) => company.id === id);
      if (!current) throw new AdminRuleError('Empresa não encontrada.');
      if (current.version !== expectedVersion) throw new AdminConflictError(current);
      const updated = applyCompanyAccessChange(current, change, authorName);
      const verb = change.kind === 'suspend' ? 'Suspendeu' : 'Reativou';
      store.write({
        companies: state.companies.map((company) => (company.id === id ? updated : company)),
        activity: [
          { id: updated.status_history[0].id, occurred_at: updated.updated_at, author_name: authorName, description: `${verb} o acesso de ${updated.legal_name}.`, company_id: id },
          ...state.activity,
        ],
      });
      return updated;
    },
    async getOverview(signal) {
      await pause(latency, signal);
      const { companies, activity } = store.read();
      return buildAdminOverview(companies, activity, adminDemoFixture.generated_at);
    },
    async listCompanies(signal) {
      await pause(latency, signal);
      return store.read().companies;
    },
  };
}

export const mockAdminRepository = createMockAdminRepository({
  storage: typeof window === 'undefined' ? null : window.sessionStorage,
});
