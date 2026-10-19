import { withRetry, CircuitBreaker, CircuitBreakerState } from './resilience';

const defaultCircuitBreaker = new CircuitBreaker({
  serviceName: 'Default API Client Breaker',
  failureThreshold: 3,
  resetTimeoutMs: 15000,
});

export async function resilientFetch(
  url: string,
  options: RequestInit & {
    maxAttempts?: number;
    baseDelayMs?: number;
    isIdempotent?: boolean;
    circuitBreaker?: CircuitBreaker;
    fallbackFn?: () => any | Promise<any>;
  } = {}
): Promise<Response> {
  const {
    maxAttempts = 3,
    baseDelayMs = 200,
    isIdempotent = options.method === 'GET' || !options.method,
    circuitBreaker = defaultCircuitBreaker,
    fallbackFn,
    ...fetchOptions
  } = options;

  const operationName = `fetch(${options.method || 'GET'} ${url})`;

  const executeFetch = async () => {
    return withRetry(
      async () => {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
           // We only retry on 5xx errors or 429 Too Many Requests
           if (response.status >= 500 || response.status === 429) {
             throw new Error(`HTTP Error ${response.status} on ${url}`);
           }
           // 4xx errors are not transient, return response to caller
           return response;
        }
        return response;
      },
      {
        maxAttempts,
        baseDelayMs,
        isIdempotent,
        operationName
      }
    );
  };

  if (fallbackFn) {
      return circuitBreaker.execute(executeFetch, async () => {
          const fallbackData = await fallbackFn();
          return new Response(JSON.stringify(fallbackData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
          });
      }) as Promise<Response>;
  }

  return circuitBreaker.execute(executeFetch);
}

// In-memory cache for request coalescing and stale-while-revalidate
const cache = new Map<string, { data: any, timestamp: number, promise?: Promise<any> }>();
const CACHE_TTL_MS = 60000;

export async function dedupedFetch(
    url: string,
    options: RequestInit = {}
): Promise<any> {
    if (options.method && options.method !== 'GET') {
        const response = await resilientFetch(url, options);
        return response.json();
    }

    const cacheKey = url;
    const cached = cache.get(cacheKey);

    if (cached) {
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
        }
        // If expired but a fetch is already inflight, return the inflight promise
        if (cached.promise) {
            return cached.promise;
        }
    }

    // Coalesce duplicate requests
    const fetchPromise = resilientFetch(url, options)
        .then(res => res.json())
        .then(data => {
            cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        })
        .catch(err => {
            cache.delete(cacheKey);
            throw err;
        });

    if (cached) {
        // Stale-while-revalidate: return stale data immediately, update cache in background
        cache.set(cacheKey, { ...cached, promise: fetchPromise });
        return cached.data;
    }

    cache.set(cacheKey, { data: null, timestamp: 0, promise: fetchPromise });
    return fetchPromise;
}
