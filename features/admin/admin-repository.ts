import { adminDemoFixture } from './demo-fixture';
import { buildAdminOverview } from './rules';
import type { AdminActivity, AdminCompany, AdminOverview } from './types';

/**
 * Contrato usado pelo painel. Dados administrativos são privados: a implementação real deve
 * consultar a API com `cache: 'no-store'` e `credentials: 'include'`, sem cache compartilhado.
 */
export interface AdminRepository {
  getOverview(signal?: AbortSignal): Promise<AdminOverview>;
  listCompanies(signal?: AbortSignal): Promise<AdminCompany[]>;
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

export function createMockAdminRepository({ latency = 400, storage = null }: { latency?: number; storage?: Storage | null } = {}): AdminRepository {
  const store = createAdminDemoStore(storage);
  return {
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
