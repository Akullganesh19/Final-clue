import { withRetry } from './recovery';

interface CacheEntry {
  response: Response;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 100;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function dedupedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const isIdempotent = method === 'GET' || method === 'HEAD';

  // Build cache key safely (simplistic version for example)
  const cacheKey = `${method}:${url}`;

  if (isIdempotent) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TTL_MS) {
      return cached.response.clone();
    }
  }

  // Wrap the actual fetch in our resilient withRetry layer
  const fetchOp = async () => {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  };

  // Generate a stable idempotency key using method, URL, and body hash if available
  const bodyHash = options.body ? JSON.stringify(options.body).length.toString() : 'empty';
  const stableOperationId = `fetch:${method}:${url}:${bodyHash}`;

  const response = await withRetry(fetchOp, {
    isIdempotent,
    operationId: isIdempotent ? undefined : stableOperationId,
    maxAttempts: isIdempotent ? 3 : 1, // Only retry idempotent requests by default
    baseDelayMs: 200,
  });

  if (isIdempotent) {
    // Evict if cache is full
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(cacheKey, {
      response: response.clone(),
      timestamp: Date.now()
    });
  }

  return response;
}
