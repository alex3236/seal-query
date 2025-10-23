// Simple in-memory cache for server-side use with TTL and periodic cleanup.
// Note: process-local. For multi-instance deployments, replace with Redis or other shared cache.

type CacheEntry = { data: any; expiresAt: number; isPermanent: boolean };
type CacheMap = Map<string, CacheEntry>;
type ShipmentCache = {
  map: CacheMap;
  ttlSeconds: number;
  cleanupInterval?: ReturnType<typeof setInterval>;
};

declare global {
  var __shipmentCache: ShipmentCache | undefined;
}

const DEFAULT_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || "60", 10);

if (!globalThis.__shipmentCache) {
  globalThis.__shipmentCache = {
    map: new Map<string, CacheEntry>(),
    ttlSeconds: DEFAULT_TTL_SECONDS,
    cleanupInterval: undefined
  };

  // cleanup every 30s
  globalThis.__shipmentCache.cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of globalThis.__shipmentCache!.map) {
      // Skip permanent cache items
      if (!v.isPermanent && v.expiresAt <= now) {
        globalThis.__shipmentCache!.map.delete(k);
      }
    }
  }, 30000);
}

export function cacheGet(key: string): any | null {
  const entry = globalThis.__shipmentCache!.map.get(key);
  if (!entry) return null;
  // Permanent cache items don't expire
  if (!entry.isPermanent && entry.expiresAt <= Date.now()) {
    globalThis.__shipmentCache!.map.delete(key);
    return null;
  }
  return entry.data;
}

export function cacheSet(key: string, data: any, ttlSeconds?: number): void {
  let ttl = typeof ttlSeconds === "number" ? ttlSeconds : globalThis.__shipmentCache!.ttlSeconds;
  if (data?.total === 0)
    ttl = 60;
  const isPermanent = ttl === -1;
  const expiresAt = isPermanent ? Number.MAX_SAFE_INTEGER : Date.now() + ttl * 1000;
  globalThis.__shipmentCache!.map.set(key, { data, expiresAt, isPermanent });
}