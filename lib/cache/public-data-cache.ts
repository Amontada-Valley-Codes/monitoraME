import { createHash } from 'node:crypto';

type CacheEntry<Value> = {
  expiresAt: number;
  value: Value;
};

export type CacheRead<Value> = {
  hit: boolean;
  value: Value;
};

type PublicDataCacheOptions = {
  maxEntries: number;
  now?: () => number;
  ttlMs: number;
};

export function createPublicDataCache<Value>({
  maxEntries,
  now = Date.now,
  ttlMs,
}: PublicDataCacheOptions) {
  const entries = new Map<string, CacheEntry<Value>>();
  const inFlight = new Map<string, Promise<Value>>();

  function removeExpired() {
    const currentTime = now();
    for (const [key, entry] of entries) {
      if (entry.expiresAt <= currentTime) entries.delete(key);
    }
  }

  function store(key: string, value: Value) {
    removeExpired();
    while (entries.size >= maxEntries) {
      const oldestKey = entries.keys().next().value as string | undefined;
      if (oldestKey === undefined) break;
      entries.delete(oldestKey);
    }
    entries.set(key, { expiresAt: now() + ttlMs, value });
  }

  async function read(key: string, load: () => Promise<Value>): Promise<CacheRead<Value>> {
    const cached = entries.get(key);
    if (cached && cached.expiresAt > now()) {
      // Refresh insertion order so the bounded map behaves as a small LRU cache.
      entries.delete(key);
      entries.set(key, cached);
      return { hit: true, value: cached.value };
    }
    if (cached) entries.delete(key);

    const pending = inFlight.get(key);
    if (pending) return { hit: true, value: await pending };

    const request = load()
      .then((value) => {
        store(key, value);
        return value;
      })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, request);
    return { hit: false, value: await request };
  }

  return { read };
}

/**
 * Produces an opaque key from public request data only. Authentication tokens
 * are deliberately not accepted by this API and therefore cannot enter the
 * cache key or its stored value.
 */
export function publicDataCacheKey(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): string {
  const hash = createHash('sha256');
  hash.update(method);
  hash.update('\0');
  hash.update(path);
  if (body !== undefined) {
    hash.update('\0');
    hash.update(JSON.stringify(body));
  }
  return hash.digest('hex');
}
