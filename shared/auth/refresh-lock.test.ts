import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshSessionAcrossTabs } from './refresh-lock';

describe('refresh entre abas', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('faz single-flight e usa navigator.locks', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ refreshed: true }), { status: 200 }));
    const request = vi.fn(async (_name: string, callback: () => Promise<void>) => callback());
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });
    vi.stubGlobal('localStorage', { setItem: vi.fn() });
    vi.stubGlobal('BroadcastChannel', class { postMessage() {} close() {} });
    vi.stubGlobal('navigator', { locks: { request } });
    vi.stubGlobal('fetch', fetchMock);
    await Promise.all([refreshSessionAcrossTabs(), refreshSessionAcrossTabs()]);
    expect(request).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/session/refresh', { method: 'POST', cache: 'no-store' });
  });
});
