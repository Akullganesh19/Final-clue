export const MAX_CACHE_SIZE = 100;
export const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  response: Response;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<Response>>();

function buildCacheKey(url: RequestInfo | URL, init?: RequestInit): string {
  const urlString = typeof url === 'string' ? url : (url instanceof URL ? url.toString() : url.url);

  if (!init || !init.headers) {
    return JSON.stringify([urlString, {}]);
  }

  const headersObj: Record<string, string> = {};
  if (init.headers instanceof Headers) {
    init.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
  } else if (Array.isArray(init.headers)) {
    init.headers.forEach(([key, value]) => {
      headersObj[key] = value;
    });
  } else {
    Object.assign(headersObj, init.headers);
  }

  // Sort keys to ensure consistent hashing
  const sortedHeaders: Record<string, string> = {};
  Object.keys(headersObj).sort().forEach(key => {
    sortedHeaders[key] = headersObj[key];
  });

  return JSON.stringify([urlString, sortedHeaders]);
}

function enforceCacheLimits() {
  if (cache.size > MAX_CACHE_SIZE) {
    // Insertion order is guaranteed by Map in JS/TS. We delete the first item.
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }
}

export async function dedupedFetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const isCacheable = method === 'GET' || method === 'HEAD';

  if (!isCacheable) {
    return (typeof window !== 'undefined' ? window.fetch : globalThis.fetch)(url, init);
  }

  const cacheKey = buildCacheKey(url, init);

  // 1. Check Cache
  const cachedEntry = cache.get(cacheKey);
  if (cachedEntry) {
    if (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      // Must return a clone to prevent "Body has already been consumed" errors on multiple uses
      return cachedEntry.response.clone();
    } else {
      cache.delete(cacheKey); // Evict expired entry
    }
  }

  // 2. Check In-Flight (Request Coalescing)
  if (inFlight.has(cacheKey)) {
    const promise = inFlight.get(cacheKey)!;
    const response = await promise;
    // Must return a clone so caller gets an unconsumed body
    return response.clone();
  }

  // 3. Make Request
  const promise = (typeof window !== 'undefined' ? window.fetch : globalThis.fetch)(url, init)
    .then(response => {
      // Cache only successful responses (e.g., 200 OK)
      if (response.ok) {
        // Clone before putting it into the cache
        cache.set(cacheKey, {
          response: response.clone(),
          timestamp: Date.now()
        });
        enforceCacheLimits();
      }
      return response;
    })
    .finally(() => {
      inFlight.delete(cacheKey);
    });

  inFlight.set(cacheKey, promise);

  const response = await promise;
  // Clone for the immediate caller, since the original response body might have been consumed or cloned into cache
  return response.clone();
}

// For testing purposes
export function clearCache() {
  cache.clear();
  inFlight.clear();
}
