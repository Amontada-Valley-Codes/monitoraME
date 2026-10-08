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

describe('conclusão do onboarding', () => {
  it('envia todos os campos exigidos pelo endpoint', async () => {
    const account = {
      id: 'account-id',
      name: 'Pessoa Teste',
      email: 'pessoa@example.com',
      phone: '+55 88 99999-9999',
      role: 'PERSON',
      status: 'ACTIVE',
    };
    const request = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(account), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', request);

    const payload = {
      name: account.name,
      cpf: '52998224725',
      email: account.email,
      phone: account.phone,
      password: 'Senha@123',
    };
    await apiService.completeOnboarding(payload, 'access-token');

    expect(request).toHaveBeenCalledWith(
      expect.stringMatching(/\/accounts\/complete$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
        headers: expect.any(Headers),
      }),
    );
    const headers = request.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer access-token');
  });
});
