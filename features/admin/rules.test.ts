import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminDemoFixture } from './demo-fixture';
import { buildAdminOverview, canManageCompanies, formatCnpj, parseAdminRole } from './rules';
import type { AdminCompany } from './types';

const companies = adminDemoFixture.companies as readonly AdminCompany[] as AdminCompany[];

describe('admin rules', () => {
  it('recognizes only admin and monitor profiles', () => {
    expect(parseAdminRole('ADMIN')).toBe('admin');
    expect(parseAdminRole(' monitor ')).toBe('monitor');
    expect(parseAdminRole('PERSON')).toBeNull();
    expect(parseAdminRole(null)).toBeNull();
  });

  it('lets only admins manage companies', () => {
    expect(canManageCompanies('admin')).toBe(true);
    expect(canManageCompanies('monitor')).toBe(false);
    expect(canManageCompanies(null)).toBe(false);
  });

  it('formats CNPJ digits', () => {
    expect(formatCnpj('00000000000191')).toBe('00.000.000/0001-91');
    expect(formatCnpj('123')).toBe('123');
  });

  it('summarizes companies by access status, size and municipality', () => {
    const overview = buildAdminOverview(companies, [...adminDemoFixture.activity], adminDemoFixture.generated_at);
    expect(overview.companies_by_status).toEqual({ pending: 4, active: 11, suspended: 2, rejected: 2 });
    expect(Object.values(overview.companies_by_size).reduce((total, value) => total + value, 0)).toBe(11);
    expect(overview.top_municipalities[0]).toMatchObject({ municipality: { name: 'Fortaleza', ibge_code: '2304400' }, total: 3 });
  });

  it('lists pending requests oldest first and keeps the existing demo protocol', () => {
    const overview = buildAdminOverview(companies, [], adminDemoFixture.generated_at);
    expect(overview.pending_requests.map((item) => item.protocol)).toEqual(['REQ-2026-91C2D', 'REQ-2026-88A9F', 'REQ-2026-93F10', 'REQ-2026-94A7B']);
  });

  it('builds an empty overview without data', () => {
    const overview = buildAdminOverview([], [], adminDemoFixture.generated_at);
    expect(overview.companies_by_status).toEqual({ pending: 0, active: 0, suspended: 0, rejected: 0 });
    expect(overview.pending_requests).toEqual([]);
  });
});

const cookieJar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined),
    has: (name: string) => cookieJar.has(name),
  }),
}));

const token = (role: string) => `x.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.y`;

describe('admin access on the server', () => {
  afterEach(() => {
    cookieJar.clear();
    vi.unstubAllEnvs();
  });

  it('grants admin and monitor roles from the session token', async () => {
    const { getAdminAccess } = await import('./server/admin-access');
    vi.stubEnv('NODE_ENV', 'production');
    cookieJar.set('access_token', token('ADMIN'));
    await expect(getAdminAccess()).resolves.toEqual({ status: 'granted', role: 'admin', demo: false });
    cookieJar.set('access_token', token('MONITOR'));
    await expect(getAdminAccess()).resolves.toEqual({ status: 'granted', role: 'monitor', demo: false });
  });

  it('forbids other profiles and asks anonymous visitors to log in outside development', async () => {
    const { getAdminAccess } = await import('./server/admin-access');
    vi.stubEnv('NODE_ENV', 'production');
    cookieJar.set('monitorame_demo_admin_role', 'admin');
    await expect(getAdminAccess()).resolves.toEqual({ status: 'unauthenticated' });
    cookieJar.set('access_token', token('PERSON'));
    await expect(getAdminAccess()).resolves.toEqual({ status: 'forbidden', demo: false });
  });

  it('uses the demo profile only in development', async () => {
    const { getAdminAccess } = await import('./server/admin-access');
    vi.stubEnv('NODE_ENV', 'development');
    await expect(getAdminAccess()).resolves.toEqual({ status: 'granted', role: 'admin', demo: true });
    cookieJar.set('monitorame_demo_admin_role', 'company');
    await expect(getAdminAccess()).resolves.toEqual({ status: 'forbidden', demo: true });
  });
});
