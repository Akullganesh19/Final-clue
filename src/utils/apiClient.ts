export const MAX_CACHE_SIZE = 100;
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
    headers.forEach((value, key) => {
      entries.push([key.toLowerCase(), value]);
    });
  } else if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      entries.push([key.toLowerCase(), value]);
    }
  } else {
    for (const [key, value] of Object.entries(headers)) {
      entries.push([key.toLowerCase(), value as string]);
    }
  }
  return entries
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join('\n');
}

export function generateCacheKey(url: string | URL | Request, options?: RequestInit): string {
  let urlStr = '';
  if (url instanceof Request) {
    urlStr = url.url;
  } else if (url instanceof URL) {
    urlStr = url.toString();
  } else {
    urlStr = url;
  }

  let method = 'GET';
  if (url instanceof Request && url.method) {
    method = url.method.toUpperCase();
  }
  if (options && options.method) {
    method = options.method.toUpperCase();
  }

  let headers = '';
  if (url instanceof Request && url.headers) {
    headers = serializeHeaders(url.headers);
  }
  if (options && options.headers) {
    headers = serializeHeaders(options.headers);
  }

  return `${method}|${urlStr}|${headers}`;
}

export async function dedupedFetch(url: string | URL | Request, options?: RequestInit): Promise<Response> {
  const method = (options?.method || (url instanceof Request ? url.method : undefined) || 'GET').toUpperCase();

  if (method !== 'GET' && method !== 'HEAD') {
    return fetch(url, options);
  }

  const cacheKey = generateCacheKey(url, options);
  const now = Date.now();

  if (cache.has(cacheKey)) {
    const entry = cache.get(cacheKey)!;
    if (now - entry.timestamp < CACHE_TTL_MS) {
      return entry.response.clone();
    } else {
      cache.delete(cacheKey);
    }
  }

  if (inFlight.has(cacheKey)) {
    const response = await inFlight.get(cacheKey)!;
    return response.clone();
  }

  const promise = fetch(url, options)
    .then((response) => {
      if (response.ok) {
        if (cache.size >= MAX_CACHE_SIZE) {
          const firstKey = cache.keys().next().value;
          if (firstKey) {
            cache.delete(firstKey);
          }
        }
        cache.set(cacheKey, {
          response: response.clone(),
          timestamp: Date.now()
        });
      }
      return response;
    })
    .finally(() => {
      inFlight.delete(cacheKey);
    });

  inFlight.set(cacheKey, promise);

  const finalResponse = await promise;
  return finalResponse.clone();
}
