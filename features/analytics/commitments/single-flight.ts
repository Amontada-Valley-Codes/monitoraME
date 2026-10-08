export function createSingleFlight<Key, Value>() {
  const active = new Map<Key, Promise<Value>>();
  return (key: Key, run: () => Promise<Value>): Promise<Value> => {
    const existing = active.get(key);
    if (existing) return existing;
    const promise = Promise.resolve()
      .then(run)
      .finally(() => active.delete(key));
    active.set(key, promise);
    return promise;
  };
}
