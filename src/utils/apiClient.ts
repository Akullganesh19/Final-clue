interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<any>>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function dedupedFetch(url: string, options?: RequestInit) {
  const isGet = !options?.method || options.method.toUpperCase() === 'GET';
  const start = performance.now();

  if (!isGet) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  const cacheKey = url;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached) {
    const isStale = now - cached.timestamp > CACHE_TTL;
    if (isStale) {
      // Revalidate in background
      if (!inFlight.has(cacheKey)) {
        const promise = fetch(url, options)
          .then(async res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(data => {
            cache.set(cacheKey, { data, timestamp: Date.now() });
            console.debug(`[Phantom] Background refresh complete for ${url}`);
            return data;
          })
          .catch(err => {
            console.error('[Phantom] Background revalidation failed:', err);
          })
          .finally(() => inFlight.delete(cacheKey));
        inFlight.set(cacheKey, promise);
      }
      console.debug(`[Phantom] Stale hit for ${url} (took ${Math.round(performance.now() - start)}ms)`);
    } else {
      console.debug(`[Phantom] Cache hit for ${url} (took ${Math.round(performance.now() - start)}ms)`);
    }
    return cached.data;
  }

  if (inFlight.has(cacheKey)) {
    console.debug(`[Phantom] Coalesced request for ${url} (avoided duplicate fetch)`);
    return inFlight.get(cacheKey);
  }

  console.debug(`[Phantom] Cache miss for ${url}, fetching from network...`);
  const promise = fetch(url, options)
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      cache.set(cacheKey, { data, timestamp: Date.now() });
      console.debug(`[Phantom] Network fetch complete for ${url} (took ${Math.round(performance.now() - start)}ms)`);
      return data;
    })
    .finally(() => inFlight.delete(cacheKey));

  inFlight.set(cacheKey, promise);
  return promise;
}

export function clearCache() {
  cache.clear();
}
