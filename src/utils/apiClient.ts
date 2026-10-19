const cache = new Map<string, { promise: Promise<any>; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function dedupedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const isGET = !options?.method || options.method.toUpperCase() === 'GET';
  const cacheKey = url; // simple key for now

  if (isGET) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.promise;
    }
  }

  const promise = fetch(url, options).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  }).catch((err) => {
    cache.delete(cacheKey); // don't cache errors
    throw err;
  });

  if (isGET) {
    cache.set(cacheKey, { promise, timestamp: Date.now() });
  }

  return promise;
}
