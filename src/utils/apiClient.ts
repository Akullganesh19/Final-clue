const MAX_CACHE_SIZE = 100;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  response: Response;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<Response>>();

function serializeHeaders(headers?: HeadersInit): string {
  if (!headers) return '';
  const entries: [string, string][] = [];

  if (headers instanceof Headers) {
    headers.forEach((value, key) => entries.push([key, value]));
  } else if (Array.isArray(headers)) {
    entries.push(...headers);
  } else {
    for (const [key, value] of Object.entries(headers)) {
      entries.push([key, String(value)]);
    }
  }

  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
}

function generateCacheKey(url: RequestInfo | URL, init?: RequestInit): string {
  const method = (init?.method || (url instanceof Request ? url.method : 'GET')).toUpperCase();
  let urlStr = '';
  if (typeof url === 'string') {
    urlStr = url;
  } else if (url instanceof URL) {
    urlStr = url.toString();
  } else {
    urlStr = url.url;
  }

  const headersStr = serializeHeaders(init?.headers || (url instanceof Request ? url.headers : undefined));
  return `${method}|${urlStr}|${headersStr}`;
}

export async function dedupedFetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || (url instanceof Request ? url.method : 'GET')).toUpperCase();

  // Only coalesce and cache idempotent methods
  if (method !== 'GET' && method !== 'HEAD') {
    return fetch(url, init);
  }

  const cacheKey = generateCacheKey(url, init);

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    if (Date.now() - cached.timestamp < TTL_MS) {
      return cached.response.clone();
    }
    // Evict expired entry
    cache.delete(cacheKey);
  }

  // Check in-flight requests (coalescing)
  if (inFlight.has(cacheKey)) {
    const response = await inFlight.get(cacheKey)!;
    return response.clone();
  }

  // Make the actual request
  const fetchPromise = fetch(url, init).then(res => {
    if (res.ok) {
      // FIFO eviction when cache is full
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
        }
      }
      cache.set(cacheKey, {
        response: res.clone(),
        timestamp: Date.now()
      });
    }
    return res;
  }).finally(() => {
    inFlight.delete(cacheKey);
  });

  inFlight.set(cacheKey, fetchPromise);

  const response = await fetchPromise;
  return response.clone();
}

// For testing purposes
export function clearCache() {
  cache.clear();
  inFlight.clear();
}
