// Request coalescing map
const inFlight = new Map<string, Promise<any>>();

/**
 * Fetches a URL, collapsing multiple identical concurrent requests into a single network call.
 * This prevents component-heavy renders from sending multiple identical requests.
 */
export async function dedupedFetch(url: string, options?: RequestInit): Promise<any> {
  // We only safely coalesce GET requests
  if (options?.method && options.method.toUpperCase() !== 'GET') {
    const res = await fetch(url, options);
    return res.json();
  }

  // Generate a key based on URL and options (e.g. headers)
  const key = `${url}-${JSON.stringify(options || {})}`;

  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const promise = fetch(url, options)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .finally(() => {
      // Remove from in-flight map once resolved or rejected
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

const swrCache = new Map<string, CacheEntry>();

/**
 * Stale-While-Revalidate (SWR) Fetch
 * Serves immediately from cache if available, while triggering a background fetch
 * to update the cache for future reads.
 *
 * @param url The endpoint to fetch
 * @param ttl Time-to-live in milliseconds before data is considered completely expired
 * @param revalidateCallback Optional callback when background revalidation completes
 */
export async function cachedFetch(
  url: string,
  ttl: number = 60000,
  revalidateCallback?: (data: any) => void
): Promise<any> {
  const key = url;
  const now = Date.now();
  const entry = swrCache.get(key);

  const fetchPromise = dedupedFetch(url)
    .then((data) => {
      swrCache.set(key, { data, timestamp: Date.now() });
      if (revalidateCallback) {
        revalidateCallback(data);
      }
      return data;
    })
    .catch((err) => {
      console.error(`Background revalidation failed for ${url}:`, err);
      // If we don't have cache, we must throw the error
      if (!entry) throw err;
      return entry.data;
    });

  if (entry) {
    // If the cache is still fresh based on TTL, return it and don't await revalidation.
    // Revalidation happens asynchronously in the background.
    if (now - entry.timestamp < ttl) {
      return entry.data;
    }
  }

  // If there's no entry or it's expired beyond TTL, we await the fetch.
  return fetchPromise;
}

/**
 * Clear the SWR cache
 */
export function clearApiCache() {
  swrCache.clear();
}
