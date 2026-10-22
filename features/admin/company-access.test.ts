import { describe, expect, it } from 'vitest';
import { AdminConflictError, createMockAdminRepository } from './admin-repository';
import { adminDemoFixture } from './demo-fixture';
import { AdminRuleError, applyCompanyAccessChange } from './rules';
import type { AdminCompany } from './types';

const companyById = (id: string) =>
  JSON.parse(JSON.stringify(adminDemoFixture.companies.find((company) => company.id === id))) as AdminCompany;

const memoryStorage = () => {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => void data.set(key, value) };
};

describe('company access changes', () => {
  it('suspends an active company with a reason recorded in the history', () => {
    const company = companyById('maracanau-informatica');
    const suspended = applyCompanyAccessChange(company, { kind: 'suspend', reason: '  Documentação vencida há 90 dias.  ' }, 'Ana Admin', '2026-10-21T10:00:00-03:00');
    expect(suspended).toMatchObject({ access_status: 'suspended', version: company.version + 1, updated_at: '2026-10-21T10:00:00-03:00' });
    expect(suspended.status_history[0]).toMatchObject({ status: 'suspended', author_name: 'Ana Admin', reason: 'Documentação vencida há 90 dias.' });
    expect(suspended.status_history.slice(1)).toEqual(company.status_history);
  });

  it('requires a suspension reason', () => {
    const company = companyById('maracanau-informatica');
    expect(() => applyCompanyAccessChange(company, { kind: 'suspend', reason: 'curto' }, 'Ana')).toThrow(AdminRuleError);
  });

  it('only suspends active companies and only reactivates suspended ones', () => {
    expect(() => applyCompanyAccessChange(companyById('monitora-me-tecnologia'), { kind: 'suspend', reason: 'Motivo suficiente aqui.' }, 'Ana')).toThrow(/ativas/);
    expect(() => applyCompanyAccessChange(companyById('crato-eventos'), { kind: 'reactivate' }, 'Ana')).toThrow(/suspensas/);
    expect(applyCompanyAccessChange(companyById('sobral-papel'), { kind: 'reactivate' }, 'Ana').access_status).toBe('active');
  });

  it('updates the dashboard summary and activity after a change', async () => {
    const repository = createMockAdminRepository({ latency: 0, storage: memoryStorage() });
    const company = (await repository.listCompanies()).find((item) => item.id === 'maracanau-informatica')!;
    await repository.changeCompanyAccess(company.id, company.version, { kind: 'suspend', reason: 'Uso indevido do acesso detectado.' }, 'Ana Admin');
    const overview = await repository.getOverview();
    expect(overview.companies_by_status).toMatchObject({ active: 10, suspended: 3 });
    expect(overview.recent_activity[0]).toMatchObject({ author_name: 'Ana Admin', company_id: company.id });
  });

  it('rejects stale versions with the latest company data', async () => {
    const repository = createMockAdminRepository({ latency: 0, storage: memoryStorage() });
    const company = (await repository.listCompanies()).find((item) => item.id === 'sobral-papel')!;
    await repository.changeCompanyAccess(company.id, company.version, { kind: 'reactivate' }, 'Ana Admin');
    const error = await repository.changeCompanyAccess(company.id, company.version, { kind: 'reactivate' }, 'Bruno Admin').catch((reason) => reason);
    expect(error).toBeInstanceOf(AdminConflictError);
    expect(error.latest).toMatchObject({ access_status: 'active', version: company.version + 1 });
  });
});
