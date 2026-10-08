import { describe, expect, it, vi } from 'vitest';

import { createPublicDataCache, publicDataCacheKey } from './public-data-cache';

describe('cache de dados públicos autenticados', () => {
  it('reutiliza o payload sem executar novamente a consulta', async () => {
    let now = 1_000;
    const cache = createPublicDataCache<{ items: number[] }>({
      maxEntries: 10,
      now: () => now,
      ttlMs: 5_000,
    });
    const load = vi.fn().mockResolvedValue({ items: [1, 2, 3] });

    await expect(cache.read('consulta', load)).resolves.toMatchObject({ hit: false });
    await expect(cache.read('consulta', load)).resolves.toEqual({
      hit: true,
      value: { items: [1, 2, 3] },
    });
    expect(load).toHaveBeenCalledOnce();

    now += 5_001;
    await cache.read('consulta', load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('não armazena erros', async () => {
    const cache = createPublicDataCache<string>({ maxEntries: 10, ttlMs: 5_000 });
    const load = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('indisponível'))
      .mockResolvedValueOnce('disponível');

    await expect(cache.read('consulta', load)).rejects.toThrow('indisponível');
    await expect(cache.read('consulta', load)).resolves.toEqual({
      hit: false,
      value: 'disponível',
    });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('gera a chave somente com método, rota e dados públicos', () => {
    const first = publicDataCacheKey('POST', '/analytics/tce/comparisons', {
      comparison_mode: 'PERIODS',
    });
    const second = publicDataCacheKey('POST', '/analytics/tce/comparisons', {
      comparison_mode: 'MUNICIPALITIES',
    });

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toBe(second);
    expect(first).not.toContain('/analytics/tce/comparisons');
  });
});
