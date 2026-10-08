import { describe, expect, it, vi } from 'vitest';
import { parseOnboardingToken, stripHashFromAddress } from './link-token';

describe('token de onboarding', () => {
  it('le o fragmento sem depender da ordem dos parametros', () => {
    expect(parseOnboardingToken('#foo=1&token=abc%201')).toBe('abc 1');
    expect(parseOnboardingToken('#token=')).toBeNull();
    expect(parseOnboardingToken('')).toBeNull();
  });

  it('remove o hash com replaceState', () => {
    const replaceState = vi.fn();
    stripHashFromAddress({ pathname: '/onboarding', search: '?source=email' } as Location, { replaceState } as unknown as History);
    expect(replaceState).toHaveBeenCalledWith(null, '', '/onboarding?source=email');
  });
});
