import { withRetry, CircuitBreaker } from './resilience';

const globalCircuitBreaker = new CircuitBreaker('GlobalAPI', 5, 30000); // 5 failures, 30s cooldown

export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  context: string = 'API Request'
): Promise<Response> {
  const fetchWithHandling = async () => {
    let url = input.toString();
    if (typeof window !== 'undefined' && url.startsWith('/')) {
        // relative URLs are fine in the browser
    } else if (typeof window === 'undefined' && url.startsWith('/')) {
        url = `http://localhost:3000${url}`;
    }

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (error) {
      // Network error or fetch implementation error
      throw error;
    }

    if (!response.ok) {
      if (response.status >= 500) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      // Return 4xx responses, don't trigger circuit breaker for client errors (usually)
      return response;
    }

    return response;
  };

  return globalCircuitBreaker.execute(
    () => withRetry(fetchWithHandling, 3, 200, context)
  );
}

interface CacheEntry {
  response: Promise<Response>;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;
const requestCache = new Map<string, CacheEntry>();

function serializeHeaders(headers?: HeadersInit): string {
  if (!headers) return '';
  if (headers instanceof Headers) {
    const entries: string[] = [];
    headers.forEach((value, key) => entries.push(`${key}:${value}`));
    return entries.sort().join('|');
  }
  if (Array.isArray(headers)) {
    return headers.map(([k, v]) => `${k}:${v}`).sort().join('|');
  }
  return Object.entries(headers).map(([k, v]) => `${k}:${v}`).sort().join('|');
}

export function dedupedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Only cache GET requests (or requests without a method, defaulting to GET)
  const method = init?.method?.toUpperCase() || 'GET';
  if (method !== 'GET') {
    return resilientFetch(input, init, `API Request (${method})`);
  }

  const url = input.toString();
  const headersKey = serializeHeaders(init?.headers);
  const cacheKey = `${url}:::${headersKey}`;

  const cached = requestCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    // Clone the response so multiple callers can consume the body independently
    return cached.response.then(res => res.clone());
  }

  // Use resilientFetch for the actual network request
  const fetchPromise = resilientFetch(input, init, `API GET ${url}`)
    .then(res => {
      // Return the response as is, but clone it for the cache
      // No wait, fetchPromise is stored in cache, so subsequent callers will await it
      // The FIRST caller gets the original, subsequent callers get clones from the cache hit block above?
      // No, we need to make sure the original promise resolves to something clonable without consuming it.
      // Better: the promise resolves to a Response, we return a clone, and save a clone for cache if needed.
      // Or just return the response to the caller, and let the caller clone it?
      // Wait, if the promise in the cache resolves, any `.then(res => res.clone())` will clone the same Response object.
      // But if the FIRST caller doesn't clone it, they might consume it before others clone it?
      // Let's store a promise that resolves to an UNCONSUMED response.
      return res;
    });

  // Wrap the promise to automatically clone the response for every awaiter, including the first one
  const clonablePromise = fetchPromise.then(res => res.clone());

  // Insert into cache
  requestCache.set(cacheKey, {
    response: fetchPromise, // store the promise resolving to the unconsumed original
    timestamp: now
  });

  // Evict oldest if cache is too large (FIFO)
  if (requestCache.size > MAX_CACHE_SIZE) {
    const firstKey = requestCache.keys().next().value;
    if (firstKey !== undefined) {
        requestCache.delete(firstKey);
    }
  }

  return clonablePromise;
}
