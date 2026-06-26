import { CircuitBreaker, withRetry, RetryOptions } from './resilience';

// Scope circuit breakers by origin/hostname to prevent one failing service from breaking others
const circuitBreakers = new Map<string, CircuitBreaker>();

function getCircuitBreaker(url: string): CircuitBreaker {
  try {
    const origin = new URL(url).origin;
    if (!circuitBreakers.has(origin)) {
      circuitBreakers.set(origin, new CircuitBreaker(3, 10000)); // 3 failures, 10s cooldown
    }
    return circuitBreakers.get(origin)!;
  } catch (e) {
    // Fallback for invalid URLs or relative paths (though fetch usually needs absolute)
    if (!circuitBreakers.has('default')) {
        circuitBreakers.set('default', new CircuitBreaker(3, 10000));
    }
    return circuitBreakers.get('default')!;
  }
}

export interface ResilientFetchOptions extends RequestInit {
  retryOptions?: RetryOptions;
  fallbackData?: any;
}

export async function resilientFetch(
  input: RequestInfo | URL,
  init?: ResilientFetchOptions
): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';
  const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  // Safe methods are generally idempotent
  const isIdempotent = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'].includes(method);

  const retryOptions: RetryOptions = {
    isIdempotent,
    ...init?.retryOptions
  };

  const fetchOperation = async () => {
    const response = await fetch(input, init);
    if (!response.ok) {
      // Throw on 5xx or specific 4xx to trigger retry/circuit breaker
      // In a real app, you might want more granular control over which statuses to retry
      if (response.status >= 500 || response.status === 429) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      // If it's a 4xx error (other than 429), we generally don't want to retry it
      // as it's a client error (e.g. 400 Bad Request, 401 Unauthorized, 404 Not Found)
      return response;
    }
    return response;
  };

  const fallbackOperation = init?.fallbackData
    ? async () => {
        // Return a mock Response object with the fallback data
        return new Response(JSON.stringify(init.fallbackData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    : undefined;

  const cb = getCircuitBreaker(urlString);
  return cb.execute(
    () => withRetry(fetchOperation, retryOptions),
    fallbackOperation
  );
}

// A simple deduped fetch wrapper
const ongoingRequests = new Map<string, Promise<Response>>();

function generateDedupeKey(url: string, init?: RequestInit): string {
    if (!init) return url;
    // Simple serialization of relevant fields to ensure different requests are treated differently
    // In a real application, you might need a more robust object hashing mechanism
    const headersStr = init.headers ? JSON.stringify(init.headers) : '';
    const bodyStr = init.body ? (typeof init.body === 'string' ? init.body : 'object') : '';
    return `${url}|${headersStr}|${bodyStr}`;
}

export async function dedupedFetch(
  input: RequestInfo | URL,
  init?: ResilientFetchOptions
): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    // Only dedupe GET requests
    const method = init?.method?.toUpperCase() || 'GET';
    if (method !== 'GET') {
        return resilientFetch(input, init);
    }

    const key = generateDedupeKey(url, init);

    if (ongoingRequests.has(key)) {
        return ongoingRequests.get(key)!.then(res => res.clone());
    }

    const requestPromise = resilientFetch(input, init).finally(() => {
        ongoingRequests.delete(key);
    });

    ongoingRequests.set(key, requestPromise);

    return requestPromise.then(res => res.clone());
}
