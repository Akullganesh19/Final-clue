export const MAX_CACHE_SIZE = 100;
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  response: Response;
  timestamp: number;
}

const inFlight = new Map<string, Promise<Response>>();
const cache = new Map<string, CacheEntry>();

/**
 * Normalizes the cache key by sorting headers.
 */
export function generateCacheKey(url: string, init?: RequestInit): string {
  let headersStr = '';
  if (init && init.headers) {
    const headers = new Headers(init.headers);
    const sortedEntries = Array.from(headers.entries()).sort(([a], [b]) => a.localeCompare(b));
    headersStr = sortedEntries.map(([k, v]) => `${k}:${v}`).join('|');
  }
  return `${url}::${headersStr}`;
}

/**
 * Evicts the oldest entries if we exceed the MAX_CACHE_SIZE.
 */
function enforceCacheLimit() {
  if (cache.size > MAX_CACHE_SIZE) {
    const keysToRemove = cache.size - MAX_CACHE_SIZE;
    const iterator = cache.keys();
    for (let i = 0; i < keysToRemove; i++) {
      const next = iterator.next();
      if (!next.done) {
        cache.delete(next.value);
      }
    }
  }
}

/**
 * Intelligent fetch wrapper that handles request coalescing and caching.
 */
export async function dedupedFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';

  // Only cache and coalesce GET requests
  if (method !== 'GET') {
    return fetch(url, init);
  }

  const cacheKey = generateCacheKey(url, init);

  // 1. Check Cache
  const cached = cache.get(cacheKey);
  if (cached) {
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.response.clone(); // Clone to prevent "Body already consumed"
    }
    // Expired
    cache.delete(cacheKey);
  }

  // 2. Check In-Flight Coalescing
  if (inFlight.has(cacheKey)) {
    const promise = inFlight.get(cacheKey)!;
    const response = await promise;
    return response.clone(); // Each caller gets their own clone
  }

  // Ensure absolute URLs in SSR to prevent Node.js relative URL crash
  let fetchUrl = url;
  if (typeof window === 'undefined' && !url.startsWith('http://') && !url.startsWith('https://')) {
    // If we're in SSR and it's a relative URL, default to localhost or an environment variable
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    fetchUrl = new URL(url, baseUrl).toString();
  }

  // 3. Make Request
  let promise: Promise<Response>;
  try {
    promise = fetch(fetchUrl, init)
      .then((res) => {
        if (res.ok) {
          cache.set(cacheKey, {
            response: res.clone(),
            timestamp: Date.now(),
          });
          enforceCacheLimit();
        }
        return res;
      })
      .catch((err) => {
        // Re-throw so caller sees it
        throw err;
      })
      .finally(() => {
        inFlight.delete(cacheKey);
      });

    inFlight.set(cacheKey, promise);
  } catch (err) {
    // Synchronous throw from fetch
    throw err;
  }

  const result = await promise;
  return result.clone(); // Clone for the initial caller
}

/**
 * Clear the cache entirely. Useful for testing or when user logs out.
 */
export function clearCache() {
  cache.clear();
  inFlight.clear();
}
