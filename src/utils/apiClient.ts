/**
 * In-flight request cache for Request Coalescing
 */
const inFlight = new Map<string, Promise<Response>>();

/**
 * dedupedFetch prevents identical simultaneous API requests.
 * Multiple components requesting the same URL simultaneously will share a single network request.
 */
export async function dedupedFetch(url: string, options?: RequestInit): Promise<Response> {
  // Only deduplicate GET requests
  if (options?.method && options.method.toUpperCase() !== 'GET') {
    return fetch(url, options);
  }

  const key = url;

  if (inFlight.has(key)) {
    return inFlight.get(key)!.then(res => res.clone());
  }

  const promise = fetch(url, options).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);

  return promise.then(res => res.clone());
}

interface CacheEntry {
  response: Response;
  timestamp: number;
}

const swrCache = new Map<string, CacheEntry>();
const SWR_STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * staleWhileRevalidateFetch serves instantly from cache if available,
 * then background fetches a fresh copy.
 */
export async function staleWhileRevalidateFetch(url: string, options?: RequestInit): Promise<Response> {
  if (options?.method && options.method.toUpperCase() !== 'GET') {
    return dedupedFetch(url, options);
  }

  const key = url;
  const cached = swrCache.get(key);
  const now = Date.now();

  const isStale = cached && (now - cached.timestamp > SWR_STALE_TIME);

  if (cached) {
    // If we have it in cache, background update it if stale, but return cached immediately
    if (isStale) {
      // Background sync, do not await
      dedupedFetch(url, options).then(res => {
        if (res.ok) {
          swrCache.set(key, { response: res.clone(), timestamp: Date.now() });
        }
      }).catch(console.error); // Ignore errors in background fetch
    }
    return cached.response.clone();
  }

  // If not in cache, fetch, cache, and return
  const res = await dedupedFetch(url, options);
  if (res.ok) {
    swrCache.set(key, { response: res.clone(), timestamp: Date.now() });
  }
  return res.clone();
}

/**
 * Clears the SWR cache. Useful for testing or manual invalidation.
 */
export function clearCache() {
  swrCache.clear();
  inFlight.clear();
}
