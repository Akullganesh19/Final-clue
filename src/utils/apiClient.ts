import { withRetry, CircuitBreaker } from './resilience';

const defaultCircuitBreaker = new CircuitBreaker(3, 5000);

export async function resilientFetch(
  url: string,
  options?: RequestInit,
  circuitBreaker: CircuitBreaker = defaultCircuitBreaker,
  fallback?: () => Promise<Response>
): Promise<Response> {
  return await circuitBreaker.execute(async () => {
    return await withRetry(async () => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    }, 3, 100);
  }, fallback);
}

const activeRequests = new Map<string, Promise<any>>();

export async function dedupedFetch<T>(
  url: string,
  options?: RequestInit,
  parseJson: boolean = true
): Promise<T> {
  const cacheKey = `${url}|${JSON.stringify(options || {})}`;

  if (activeRequests.has(cacheKey)) {
    return activeRequests.get(cacheKey) as Promise<T>;
  }

  const requestPromise = (async () => {
    try {
      const response = await resilientFetch(url, options);
      if (parseJson) {
        return await response.json();
      }
      return response as any;
    } finally {
      activeRequests.delete(cacheKey);
    }
  })();

  activeRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
