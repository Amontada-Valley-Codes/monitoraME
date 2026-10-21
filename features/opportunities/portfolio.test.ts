import { describe, expect, it } from 'vitest';
import { companyDemoFixture } from './demo-fixture';
import {
  PORTFOLIO_STAGES,
  PortfolioRuleError,
  applyPortfolioChange,
  canEditPortfolio,
  type PortfolioEntry,
  type PortfolioItem,
  type PortfolioMember,
} from './portfolio';
import { createMockPortfolioRepository, PortfolioConflictError, PortfolioLimitError } from './portfolio-repository';
import type { Opportunity } from './types';

const opportunities = companyDemoFixture.opportunities as readonly Opportunity[];
const entryFor = (id: string, status?: Opportunity['status']): PortfolioEntry => {
  const item = JSON.parse(JSON.stringify(companyDemoFixture.portfolio.find((entry) => entry.id === id))) as PortfolioItem;
  const opportunity = { ...opportunities.find((entry) => entry.id === item.opportunityId)! };
  return { ...item, opportunity: status ? { ...opportunity, status } : opportunity };
};

describe('portfolio rules', () => {
  it('keeps the fixed catalog of 11 internal stages', () => {
    expect(PORTFOLIO_STAGES.map((stage) => stage.label)).toEqual([
      'Em análise', 'Interessada', 'Preparando documentação', 'Participação confirmada', 'Proposta enviada no portal oficial',
      'Aguardando resultado', 'Vencedora integral', 'Vencedora parcial', 'Não vencedora', 'Descartada', 'Resultado não confirmado',
    ]);
    expect(companyDemoFixture.portfolio.every((item) => PORTFOLIO_STAGES.some((stage) => stage.id === item.stage))).toBe(true);
  });

  it('rejects stages outside the catalog', () => {
    const change = { kind: 'stage', stage: 'custom' } as never;
    expect(() => applyPortfolioChange(entryFor('pf-fortaleza'), change, 'ana')).toThrow(PortfolioRuleError);
  });

  it('requires a reason to discard', () => {
    const entry = entryFor('pf-fortaleza');
    expect(() => applyPortfolioChange(entry, { kind: 'stage', stage: 'discarded' }, 'ana')).toThrow(/motivo/);
    expect(() => applyPortfolioChange(entry, { kind: 'stage', stage: 'discarded', discardReason: 'curto' }, 'ana')).toThrow(/motivo/);
    const next = applyPortfolioChange(entry, { kind: 'stage', stage: 'discarded', discardReason: 'Fora da capacidade de entrega.' }, 'ana');
    expect(next.discardReason).toBe('Fora da capacidade de entrega.');
    expect(next.history[0]).toMatchObject({ action: 'stage', to: 'discarded', authorId: 'ana', note: 'Fora da capacidade de entrega.' });
  });

  it('requires explicit confirmation to mark the proposal as submitted', () => {
    const entry = entryFor('pf-caucaia');
    expect(() => applyPortfolioChange(entry, { kind: 'stage', stage: 'submitted' }, 'ana')).toThrow(/Confirme/);
    expect(applyPortfolioChange(entry, { kind: 'stage', stage: 'submitted', submissionConfirmed: true }, 'ana').stage).toBe('submitted');
  });

  it('blocks incompatible stages without erasing internal data when the official status is interrupted', () => {
    const suspended = entryFor('pf-pacatuba');
    expect(() => applyPortfolioChange(suspended, { kind: 'stage', stage: 'confirmed' }, 'ana')).toThrow(/suspensa/);
    expect(applyPortfolioChange(suspended, { kind: 'stage', stage: 'preparing' }, 'ana').stage).toBe('preparing');

    const annulled = entryFor('pf-maranguape');
    expect(() => applyPortfolioChange(annulled, { kind: 'stage', stage: 'confirmed' }, 'ana')).toThrow(/anulada/);
    expect(annulled).toMatchObject({ stage: 'preparing', assigneeId: 'ana', internalDeadline: '2026-10-18' });
    expect(applyPortfolioChange(annulled, { kind: 'stage', stage: 'unconfirmed' }, 'ana').stage).toBe('unconfirmed');
  });

  it('archives as a separate action that preserves history and requires restoring before editing', () => {
    const entry = entryFor('pf-fortaleza');
    const archived = applyPortfolioChange(entry, { kind: 'archive' }, 'bruno');
    expect(archived).toMatchObject({ archived: true, stage: entry.stage, version: entry.version + 1 });
    expect(archived.history.slice(1)).toEqual(entry.history);
    expect(() => applyPortfolioChange(archived, { kind: 'assignee', assigneeId: 'ana' }, 'bruno')).toThrow(/Restaure/);
    expect(applyPortfolioChange(archived, { kind: 'restore' }, 'bruno').archived).toBe(false);
  });

  it('only lets admins and managers edit', () => {
    const people = companyDemoFixture.people as readonly PortfolioMember[];
    expect(people.filter(canEditPortfolio).map((person) => person.id)).toEqual(['ana', 'bruno']);
  });
});

describe('mock portfolio repository', () => {
  it('reduces the active plan usage when archiving', async () => {
    const { repository } = createMockPortfolioRepository({ latency: 0 });
    const before = await repository.load();
    expect(before.usage).toEqual({ used: 42, limit: 500 });
    const entry = before.entries.find((item) => item.id === 'pf-fortaleza')!;
    await repository.update(entry.id, entry.version, { kind: 'archive' }, 'ana');
    const after = await repository.load();
    expect(after.usage.used).toBe(41);
    expect(after.entries.find((item) => item.id === 'pf-fortaleza')?.history).toHaveLength(entry.history.length + 1);
  });

  it('returns the latest version on conflict', async () => {
    const { repository, demo } = createMockPortfolioRepository({ latency: 0 });
    const entry = (await repository.load()).entries.find((item) => item.id === 'pf-caucaia')!;
    demo.failNextMutation('conflict');
    const error = await repository.update(entry.id, entry.version, { kind: 'assignee', assigneeId: 'bruno' }, 'ana').catch((reason) => reason);
    expect(error).toBeInstanceOf(PortfolioConflictError);
    expect(error.latest.version).toBe(entry.version + 1);
    await expect(repository.update(entry.id, error.latest.version, { kind: 'assignee', assigneeId: 'bruno' }, 'ana')).resolves.toMatchObject({ assigneeId: 'bruno' });
  });

  it('blocks adding when the plan limit is reached', async () => {
    const { repository, demo } = createMockPortfolioRepository({ latency: 0 });
    const { available } = await repository.load();
    demo.setPlanLimitReached(true);
    await expect(repository.add(available[0].id, 'ana')).rejects.toBeInstanceOf(PortfolioLimitError);
  });
});
