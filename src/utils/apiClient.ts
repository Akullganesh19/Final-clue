/**
 * API Client utilities - Invisible Infrastructure
 * Provides request coalescing and stale-while-revalidate caching.
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  responseClone: Response;
}

const inFlight = new Map<string, Promise<Response>>();
const cache = new Map<string, CacheEntry>();

const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh
const STALE_TTL_MS = 5 * 60 * 1000; // 5 minutes stale

/**
 * Intelligent fetch wrapper that provides:
 * 1. Request coalescing: Multiple identical concurrent requests share one underlying network call.
 * 2. Stale-while-revalidate caching: Returns stale data instantly while fetching fresh data in the background.
 */
export async function dedupedFetch(url: string | URL, options?: RequestInit): Promise<Response> {
  const urlStr = url.toString();

  // Only cache GET requests
  const isCacheable = !options?.method || options.method.toUpperCase() === 'GET';
  const cacheKey = `${urlStr}|${JSON.stringify(options || {})}`;

  if (isCacheable) {
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      if (now - cached.timestamp < CACHE_TTL_MS) {
        // Fresh hit - return clone immediately
        return cached.responseClone.clone();
      } else if (now - cached.timestamp < STALE_TTL_MS) {
        // Stale hit - trigger background refresh if not already in flight
        if (!inFlight.has(cacheKey)) {
          // Background refresh
          const refreshPromise = fetch(urlStr, options)
            .then(res => {
              if (res.ok) {
                cache.set(cacheKey, {
                  data: null, // Not used, just storing response
                  timestamp: Date.now(),
                  responseClone: res.clone()
                });
              }
              return res;
            })
            .finally(() => {
              inFlight.delete(cacheKey);
            });
          inFlight.set(cacheKey, refreshPromise);
        }
        // Return stale data immediately
        return cached.responseClone.clone();
      }
    }
  }

  // Not in cache, or stale beyond TTL, or not cacheable.
  // Check if there's already a request in flight for this key.
  if (inFlight.has(cacheKey)) {
    const response = await inFlight.get(cacheKey)!;
    return response.clone();
  }

  // No in-flight request, make a new one.
  const promise = fetch(urlStr, options)
    .then(res => {
      if (isCacheable && res.ok) {
        cache.set(cacheKey, {
          data: null,
          timestamp: Date.now(),
          responseClone: res.clone()
        });
      }
      return res;
    })
    .finally(() => {
      inFlight.delete(cacheKey);
    });

  inFlight.set(cacheKey, promise);

  const response = await promise;
  return response.clone();
}

/**
 * Advanced resilientFetch placeholder (can be expanded later with CircuitBreaker)
 * Currently just passes through to dedupedFetch
 */
export async function resilientFetch(url: string | URL, options?: RequestInit): Promise<Response> {
  return dedupedFetch(url, options);
}

// Export a way to clear the cache for testing purposes
export function clearApiCache() {
  cache.clear();
  inFlight.clear();
}
