import { withRetry, CircuitBreaker } from './resilience';

const defaultBreaker = new CircuitBreaker(5, 30000);

export async function resilientFetch(
  url: string,
  options?: RequestInit,
  breaker: CircuitBreaker = defaultBreaker
): Promise<Response> {
  return breaker.execute(() =>
    withRetry(async () => {
      const response = await fetch(url, options);
      if (!response.ok && response.status >= 500) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    })
  );
}

interface CacheEntry {
  data: Promise<Response>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateCacheKey(url: string, options?: RequestInit): string {
  if (!options) return url;

  let key = url;
  if (options.method) key += `|${options.method}`;
  if (options.body) key += `|${options.body}`;

  if (options.headers) {
    const headers = new Headers(options.headers);
    const sortedHeaders = Array.from(headers.entries()).sort(([a], [b]) => a.localeCompare(b));
    key += `|${JSON.stringify(sortedHeaders)}`;
  }

  return key;
}

export function dedupedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Only cache GET requests
  if (options && options.method && options.method !== 'GET') {
     return resilientFetch(url, options);
  }

  const key = generateCacheKey(url, options);
  const now = Date.now();

  const existing = cache.get(key);
  if (existing) {
    if (now - existing.timestamp < CACHE_TTL_MS) {
      return existing.data.then(res => res.clone());
    } else {
      cache.delete(key);
    }
  }

  const fetchPromise = resilientFetch(url, options);

  if (cache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry (Map iterates in insertion order)
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }

  cache.set(key, {
    data: fetchPromise.then(res => res.clone()),
    timestamp: now
  });

  return fetchPromise;
}
