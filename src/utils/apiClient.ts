export interface CacheEntry {
  data: ArrayBuffer;
  headers: Headers;
  timestamp: number;
}

export interface FetchResult {
  data: ArrayBuffer;
  headers: Headers;
  status: number;
  statusText: string;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<FetchResult>>();

// Default TTL of 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

function enforceCacheSizeLimit() {
  if (cache.size > MAX_CACHE_SIZE) {
    // Maps iterate in insertion order, so the first key is the oldest
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }
}

export async function dedupedFetch(url: string, options?: RequestInit): Promise<Response> {
  const method = options?.method || 'GET';
  if (method.toUpperCase() !== 'GET') {
    return fetch(url, options);
  }

  const cacheKey = url;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  // Return fresh cache immediately
  if (cached && now - cached.timestamp < DEFAULT_TTL) {
    return new Response(cached.data.slice(0), {
      status: 200,
      headers: cached.headers,
    });
  }

  // Join in-flight request if one exists
  if (inFlight.has(cacheKey)) {
    const { data, headers, status, statusText } = await inFlight.get(cacheKey)!;
    return new Response(data.slice(0), { status, statusText, headers });
  }

  // Start a new request
  const promise = (async () => {
    try {
      const res = await fetch(url, options);
      const data = await res.arrayBuffer();
      const headers = new Headers(res.headers);
      const status = res.status;
      const statusText = res.statusText;

      if (res.ok) {
        cache.set(cacheKey, { data, headers, timestamp: Date.now() });
        enforceCacheSizeLimit();
      }
      return { data, headers, status, statusText };
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);

  // Stale-while-revalidate: return stale data immediately while fetching in background
  if (cached) {
    promise.catch(() => {}); // Catch background errors silently
    return new Response(cached.data.slice(0), {
      status: 200,
      headers: cached.headers,
    });
  }

  // Await the new request
  const { data, headers, status, statusText } = await promise;
  return new Response(data.slice(0), { status, statusText, headers });
}

export function clearCache() {
  cache.clear();
}
