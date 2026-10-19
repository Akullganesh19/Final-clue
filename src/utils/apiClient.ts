import { withRetry, CircuitBreaker } from './resilience';

const globalCircuitBreaker = new CircuitBreaker(3, 15000); // 3 failures, 15s cooldown

/**
 * Wraps a fetch call with circuit breaker and retry logic.
 */
export async function resilientFetch(url: string, options?: RequestInit): Promise<Response> {
  return globalCircuitBreaker.execute(() =>
    withRetry(async () => {
      const response = await fetch(url, options);
      if (!response.ok && response.status >= 500) {
        // Treat 5xx server errors as transient failures to trigger retry/circuit breaker
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response;
    }, 3, 200)
  );
}

const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();

export async function dedupedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET';

  // Only cache GET requests
  if (method !== 'GET') {
    const response = await resilientFetch(url, options);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return response.json();
  }

  const cacheKey = url;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Request coalescing
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    try {
      const response = await resilientFetch(url, options);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();

      // Update cache (FIFO Eviction)
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
      cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
