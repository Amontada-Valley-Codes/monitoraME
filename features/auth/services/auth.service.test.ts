import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiService } from './auth.service';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('renovação de sessão', () => {
  it('envia o refreshToken e retorna o novo par de tokens', async () => {
    const tokens = {
      accessToken: 'novo-access-token',
      refreshToken: 'novo-refresh-token',
    };
    const request = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(tokens), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', request);

    await expect(apiService.refreshSession('refresh-token-atual')).resolves.toEqual(tokens);
    expect(request).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledWith(
      expect.stringMatching(/\/sessions\/refresh$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'refresh-token-atual' }),
      }),
    );
  });
});
