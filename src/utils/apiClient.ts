import { withRetry, CircuitBreaker } from './resilience';

const defaultCircuitBreaker = new CircuitBreaker('api-client-cb', {
  failureThreshold: 3,
  resetTimeoutMs: 15000,
});

/**
 * Enhanced fetch client with exponential backoff and circuit breaker.
 */
export async function resilientFetch(
  url: string,
  options?: RequestInit,
  cb: CircuitBreaker = defaultCircuitBreaker
): Promise<Response> {
  return cb.execute(
    async () => {
      return withRetry(
        async () => {
          const response = await fetch(url, options);
          if (!response.ok) {
            // Throw for non-2xx responses to trigger retry/circuit breaker
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        },
        {
          maxAttempts: 3,
          initialDelayMs: 200,
          maxDelayMs: 2000,
          factor: 2,
        }
      );
    },
    // Fallback: If circuit is OPEN, return a constructed fallback response or throw a specific error
    async () => {
      console.warn(`[Fallback] Circuit breaker is OPEN for ${url}`);
      throw new Error("Service currently unavailable. Please try again later.");
    }
  );
}

// In-memory cache for request coalescing
const pendingRequests = new Map<string, Promise<any>>();
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function dedupedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options || {})}`;

  // Check cache (stale-while-revalidate pattern can be expanded here)
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data as T;
  }

  // Request coalescing: if a request is already pending, return its promise
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Use the resilient fetch to make the actual request
  const requestPromise = resilientFetch(url, options)
    .then(async res => {
      const data = await res.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
