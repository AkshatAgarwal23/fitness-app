const store = new Map<string, { data: unknown; at: number }>();
const TTL = 60_000;

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > TTL) { store.delete(key); return null; }
  return entry.data as T;
}

export function setCached(key: string, data: unknown): void {
  store.set(key, { data, at: Date.now() });
}

export function invalidate(key: string): void {
  store.delete(key);
}
