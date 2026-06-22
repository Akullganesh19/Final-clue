/**
 * 🌀 Phantom Infrastructure: Intelligent API Client
 *
 * Provides:
 * 1. Request Coalescing: Multiple simultaneous requests for the same URL share the same promise.
 * 2. Stale-While-Revalidate Caching: Returns cached data instantly while refreshing in the background.
 * 3. Graceful Degradation: Falls back to stale data if the network fetch fails.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const inFlight = new Map<string, Promise<any>>();

const TTL = 5 * 60 * 1000; // 5 minutes fresh
const STALE_TTL = 24 * 60 * 60 * 1000; // 24 hours stale allowed

export async function dedupedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  // Only cache GET requests
  const isGet = !options?.method || options.method.toUpperCase() === 'GET';
  const cacheKey = url;

  if (isGet) {
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      const age = now - cached.timestamp;

      if (age < TTL) {
        // Data is fresh, return instantly
        return cached.data;
      }

      if (age < STALE_TTL) {
        // Data is stale. Return instantly, but fetch fresh in the background.
        if (!inFlight.has(cacheKey)) {
          const promise = fetchFresh<T>(url, options)
            .catch((err) => {
              console.error(`[Phantom] Background refresh failed for ${url}`, err);
              // Do not re-throw to prevent Unhandled Promise Rejection for background task
            })
            .finally(() => {
              inFlight.delete(cacheKey);
            });
          inFlight.set(cacheKey, promise);
        }
        return cached.data;
      }
    }
  }

  // If we already have a fetch in flight for this URL, wait for it (Request Coalescing)
  if (isGet && inFlight.has(cacheKey)) {
    try {
      return await inFlight.get(cacheKey) as Promise<T>;
    } catch (error) {
      // Graceful degradation: If coalesced fetch fails, try to return stale data even if past STALE_TTL
      if (isGet) {
        const cached = cache.get(cacheKey);
        if (cached) {
          console.warn(`[Phantom] Coalesced fetch failed, falling back to stale cache for ${url}`);
          return cached.data;
        }
      }
      throw error;
    }
  }

  const promise = fetchFresh<T>(url, options).finally(() => {
    if (isGet) inFlight.delete(cacheKey);
  });

  if (isGet) {
    inFlight.set(cacheKey, promise);
  }

  try {
    return await promise;
  } catch (error) {
    // Graceful degradation: If fetch fails, try to return stale data even if past STALE_TTL
    if (isGet) {
      const cached = cache.get(cacheKey);
      if (cached) {
        console.warn(`[Phantom] Fetch failed, falling back to stale cache for ${url}`);
        return cached.data;
      }
    }
    throw error;
  }
}

async function fetchFresh<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  if (!options?.method || options.method.toUpperCase() === 'GET') {
    cache.set(url, { data, timestamp: Date.now() });
  }

  return data;
}

export const clearCache = (url?: string) => {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
};
