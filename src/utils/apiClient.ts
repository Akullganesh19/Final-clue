export interface FetchCacheEntry {
  response: Response;
  timestamp: number;
}

const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000;

class FetchCache {
  private cache = new Map<string, FetchCacheEntry>();

  set(key: string, response: Response) {
    if (!this.cache.has(key) && this.cache.size >= MAX_CACHE_SIZE) {
      // FIFO eviction: remove the first item (insertion order)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { response, timestamp: Date.now() });
  }

  get(key: string): Response | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return undefined;
    }
    // Need to clone the response to prevent body consumption errors
    return entry.response.clone();
  }

  clear() {
    this.cache.clear();
  }
}

export const fetchCache = new FetchCache();

const pendingRequests = new Map<string, Promise<Response>>();

// Help serialize headers reliably for cache keys
function serializeHeaders(headers?: HeadersInit): string {
  if (!headers) return '';
  const entries: [string, string][] = [];
  if (headers instanceof Headers) {
    headers.forEach((value, key) => entries.push([key, value]));
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => entries.push([key, value]));
  } else {
    for (const [key, value] of Object.entries(headers)) {
      entries.push([key, value]);
    }
  }
  // Build a string manually since JSON.stringify on Headers is {}
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('\n');
}

export function generateCacheKey(input: RequestInfo | URL, init?: RequestInit): string {
  let urlStr = '';
  if (typeof input === 'string') {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (input && typeof input === 'object' && 'url' in input) {
    urlStr = (input as any).url;
  } else {
    urlStr = String(input);
  }

  const method = init?.method?.toUpperCase() || 'GET';
  const headersStr = serializeHeaders(init?.headers);
  const bodyStr = init?.body ? String(init.body) : '';

  // Use JSON.stringify array for safe combination against delimiter injection
  return JSON.stringify([urlStr, method, headersStr, bodyStr]);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Unreachable");
}

export interface DedupedFetchOptions extends RequestInit {
  idempotencyKey?: string;
  maxRetries?: number;
  baseDelayMs?: number;
}

export async function dedupedFetch(
  input: RequestInfo | URL,
  init?: DedupedFetchOptions
): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';
  const isIdempotent = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';

  if (!isIdempotent && !init?.idempotencyKey) {
    throw new Error('Non-idempotent operations must provide an idempotencyKey to prevent unsafe retries.');
  }

  // Include idempotencyKey in the headers if provided
  const modifiedInit = { ...init };
  if (init?.idempotencyKey) {
    const headers = new Headers(init.headers);
    headers.set('Idempotency-Key', init.idempotencyKey);
    modifiedInit.headers = headers;
  }

  const cacheKey = generateCacheKey(input, modifiedInit);

  // If it's a GET, try cache first
  if (method === 'GET') {
    const cachedResponse = fetchCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  // Request coalescing for identical pending requests
  if (pendingRequests.has(cacheKey)) {
    const pending = pendingRequests.get(cacheKey)!;
    const response = await pending;
    return response.clone();
  }

  const fetchPromise = (async () => {
    try {
      let lastResponse: Response | null = null;
      try {
        const response = await withRetry(
          async () => {
            const res = await fetch(input, modifiedInit);
            lastResponse = res;
            if (res.status >= 500) {
              throw new Error(`Transient server error: ${res.status}`);
            }
            return res;
          },
          init?.maxRetries ?? 3,
          init?.baseDelayMs ?? 100
        );

        if (method === 'GET' && response.ok) {
          // Clone for caching
          fetchCache.set(cacheKey, response.clone());
        }
        return response;
      } catch (err) {
        if (lastResponse) {
          // If we have a response object, return it even if it's a 500 so callers can handle it
          return lastResponse;
        }
        throw err;
      }
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, fetchPromise);

  const response = await fetchPromise;
  return response.clone(); // Clone for the caller to avoid body already consumed issues
}
