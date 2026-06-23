interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<any>>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function dedupedFetch(url: string, options?: RequestInit) {
  const isGet = !options?.method || options.method.toUpperCase() === 'GET';

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
            return data;
          })
          .catch(err => {
            console.error('Background revalidation failed:', err);
          })
          .finally(() => inFlight.delete(cacheKey));
        inFlight.set(cacheKey, promise);
      }
    }
    return cached.data;
  }

  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey);
  }

  const promise = fetch(url, options)
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => inFlight.delete(cacheKey));

  inFlight.set(cacheKey, promise);
  return promise;
}

export function clearCache() {
  cache.clear();
}
