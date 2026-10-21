import { companyDemoFixture } from './demo-fixture';
import {
  activePortfolioCount,
  applyPortfolioChange,
  PortfolioRuleError,
  type PortfolioChange,
  type PortfolioEntry,
  type PortfolioItem,
  type PortfolioMember,
} from './portfolio';
import type { Opportunity } from './types';

export type PortfolioUsage = { used: number; limit: number };
export type PortfolioSnapshot = { entries: PortfolioEntry[]; usage: PortfolioUsage; members: PortfolioMember[]; available: Opportunity[] };
export type PortfolioMutationOutcome = 'success' | 'error' | 'conflict';

export class PortfolioConflictError extends Error {
  constructor(public latest: PortfolioEntry) {
    super('Esta oportunidade foi alterada por outra pessoa. Exibimos a versão mais recente.');
  }
}
export class PortfolioLimitError extends Error {}

/** Contrato usado pela interface. Uma implementação de API pode substituir o mock sem alterar os componentes. */
export interface PortfolioRepository {
  load(): Promise<PortfolioSnapshot>;
  add(opportunityId: string, authorId: string): Promise<PortfolioEntry>;
  update(id: string, expectedVersion: number, change: PortfolioChange, authorId: string): Promise<PortfolioEntry>;
}

const STORAGE_KEY = 'monitorame:demo-portfolio';
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type MockOptions = { latency?: number; storage?: Pick<Storage, 'getItem' | 'setItem'> | null; limit?: number };

export function createMockPortfolioRepository({ latency = 450, storage, limit }: MockOptions = {}) {
  const opportunities = companyDemoFixture.opportunities as readonly Opportunity[];
  const fixtureItems = clone(companyDemoFixture.portfolio) as PortfolioItem[];
  const baseUsage = companyDemoFixture.workspaceUsage.activeOpportunities;
  // O consumo do plano inclui oportunidades que não fazem parte do recorte da demonstração.
  const outsideDemo = baseUsage.used - activePortfolioCount(fixtureItems);
  let items: PortfolioItem[] | null = null;
  let nextOutcome: PortfolioMutationOutcome = 'success';
  let planLimit = limit ?? baseUsage.limit;

  const read = () => {
    if (items) return items;
    try {
      const raw = storage?.getItem(STORAGE_KEY);
      items = raw ? (JSON.parse(raw) as PortfolioItem[]) : clone(fixtureItems);
    } catch {
      items = clone(fixtureItems);
    }
    return items;
  };
  const write = (next: PortfolioItem[]) => {
    items = next;
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* demo state stays in memory */ }
  };
  const join = (item: PortfolioItem): PortfolioEntry => {
    const opportunity = opportunities.find((entry) => entry.id === item.opportunityId);
    if (!opportunity) throw new Error(`Oportunidade ${item.opportunityId} ausente da fixture.`);
    return { ...clone(item), opportunity: clone(opportunity) };
  };
  const strip = (entry: PortfolioEntry): PortfolioItem => {
    const item: Partial<PortfolioEntry> = { ...entry };
    delete item.opportunity;
    return item as PortfolioItem;
  };
  const usage = (): PortfolioUsage => ({ used: outsideDemo + activePortfolioCount(read()), limit: planLimit });
  const takeOutcome = () => {
    const outcome = nextOutcome;
    nextOutcome = 'success';
    return outcome;
  };

  const repository: PortfolioRepository = {
    async load() {
      await pause(latency);
      const tracked = new Set(read().map((item) => item.opportunityId));
      return {
        entries: read().map(join),
        usage: usage(),
        members: clone(companyDemoFixture.people) as PortfolioMember[],
        available: opportunities.filter((item) => !tracked.has(item.id)).map(clone),
      };
    },
    async add(opportunityId, authorId) {
      await pause(latency);
      if (takeOutcome() === 'error') throw new Error('Falha simulada ao salvar.');
      if (read().some((item) => item.opportunityId === opportunityId)) throw new PortfolioRuleError('Esta oportunidade já está na carteira.');
      if (usage().used >= usage().limit) throw new PortfolioLimitError('Limite de oportunidades ativas do plano atingido.');
      const item: PortfolioItem = {
        id: `pf-${opportunityId}`, opportunityId, stage: 'analysis', assigneeId: authorId, internalDeadline: null, archived: false, version: 1,
        history: [{ id: `pf-${opportunityId}-v1`, at: new Date().toISOString(), authorId, action: 'created', to: 'analysis' }],
      };
      write([item, ...read()]);
      return join(item);
    },
    async update(id, expectedVersion, change, authorId) {
      await pause(latency);
      const current = read().find((item) => item.id === id);
      if (!current) throw new PortfolioRuleError('Oportunidade não encontrada na carteira.');
      const outcome = takeOutcome();
      if (outcome === 'error') throw new Error('Falha simulada ao salvar.');
      let entry = join(current);
      if (outcome === 'conflict') {
        // Simula outra pessoa da equipe salvando antes: o servidor avança a versão.
        const other = companyDemoFixture.people.find((person) => person.id !== authorId)?.id ?? 'ana';
        const deadline = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
        entry = applyPortfolioChange(entry, { kind: 'deadline', deadline }, other);
        write(read().map((item) => (item.id === id ? strip(entry) : item)));
      }
      if (entry.version !== expectedVersion) throw new PortfolioConflictError(entry);
      if (change.kind === 'restore' && usage().used >= usage().limit) {
        throw new PortfolioLimitError('Limite de oportunidades ativas do plano atingido.');
      }
      const saved = applyPortfolioChange(entry, change, authorId);
      write(read().map((item) => (item.id === id ? strip(saved) : item)));
      return saved;
    },
  };

  return {
    repository,
    /** Controles exclusivos do modo demonstrativo. */
    demo: {
      failNextMutation: (outcome: PortfolioMutationOutcome) => { nextOutcome = outcome; },
      pendingOutcome: () => nextOutcome,
      setPlanLimitReached: (reached: boolean) => { planLimit = reached ? usage().used : limit ?? baseUsage.limit; },
      reset: () => write(clone(fixtureItems)),
    },
  };
}

export const mockPortfolio = createMockPortfolioRepository({
  storage: typeof window === 'undefined' ? null : window.sessionStorage,
});
