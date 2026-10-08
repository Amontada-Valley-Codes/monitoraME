import { beforeEach, describe, expect, it, vi } from 'vitest';
import { consumeReturnTo, isValidReturnTo, peekReturnTo, RETURN_TO_KEY, RETURN_TO_TTL_MS, saveReturnTo } from './return-to';

describe('returnTo', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
  });

  it.each([
    '/analytics/overview-municipal?x=1',
    '/analytics/fornecedores/1',
    '/analitico',
    '/analitico/municipios?municipality_tce_code=010',
  ])('aceita %s', (path) => expect(isValidReturnTo(path)).toBe(true));

  it.each(['//evil.com', '/\\evil', 'https://evil.com', 'javascript:alert(1)', '/onboarding', '/login'])('rejeita %s', (path) => expect(isValidReturnTo(path)).toBe(false));

  it('expira e consome uma unica vez', () => {
    expect(saveReturnTo('/analytics/overview-municipal', 100)).toBe(true);
    expect(peekReturnTo(100 + RETURN_TO_TTL_MS + 1)).toBeNull();
    localStorage.setItem(RETURN_TO_KEY, JSON.stringify({ path: '/analytics/overview-municipal?x=1', createdAt: 200 }));
    expect(consumeReturnTo(201)).toBe('/analytics/overview-municipal?x=1');
    expect(consumeReturnTo(201)).toBeNull();
  });
});

