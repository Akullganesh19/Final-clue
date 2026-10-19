import { withRetry, CircuitBreaker } from './resilience';

const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

// Global cache storage
const fetchCache = new Map<string, CacheEntry>();

// Global circuit breaker instance to protect API calls
const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  cooldownPeriodMs: 10000 // 10 seconds
});

/**
 * Resilient fetch wrapper that uses CircuitBreaker and Exponential Backoff Retries.
 *
 * @param url The URL to fetch.
 * @param options Fetch options.
 * @param retryOptions Retry options.
 * @returns Response data.
 */
export async function resilientFetch(
  url: string,
  options?: RequestInit,
  retryOptions?: { maxAttempts?: number; baseDelayMs?: number }
): Promise<Response> {
  return await apiCircuitBreaker.execute(async () => {
    return await withRetry(async () => {
      const response = await fetch(url, options);

      // If the response is not ok, throw an error to trigger a retry/circuit break
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return response;
    }, retryOptions);
  });
}

/**
 * A cached, deduped fetch function using the resilient fetch mechanism.
 *
 * @param url The URL to fetch.
 * @param options Fetch options.
 * @returns Parsed JSON response.
 */
export async function dedupedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  // Only cache GET requests
  const isGet = !options?.method || options.method.toUpperCase() === 'GET';

  if (!isGet) {
    const response = await resilientFetch(url, options);
    return response.json();
  }

  const cacheKey = url;
  const cached = fetchCache.get(cacheKey);

  // Check if we have a valid cached entry
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // Fetch the data
  const response = await resilientFetch(url, options);
  const data = await response.json();

  // Manage cache size using FIFO (insertion order)
  if (fetchCache.size >= MAX_CACHE_SIZE) {
    // Maps iterate in insertion order, so the first key is the oldest
    const oldestKey = fetchCache.keys().next().value;
    if (oldestKey) {
      fetchCache.delete(oldestKey);
    }
  }

  // Store in cache
  fetchCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  return data;
}

// Exposed for testing
export function clearFetchCache() {
  fetchCache.clear();
}
