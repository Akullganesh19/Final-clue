// Request coalescing infrastructure
// Deduplicates identical in-flight fetch requests

interface CoalescingEntry {
  promise: Promise<Response>;
  consumers: number;
}

const inFlight = new Map<string, CoalescingEntry>();

function getDeterministicCacheKey(input: RequestInfo | URL, init?: RequestInit): string | null {
  let url = '';
  let method = 'GET';
  let headersObj: Record<string, string> = {};
  let signal: AbortSignal | null | undefined = null;

  if (typeof Request !== 'undefined' && input instanceof Request) {
    url = input.url;
    method = input.method || 'GET';
    signal = input.signal;

    // Extract headers from Request
    if (input.headers) {
      input.headers.forEach((value, key) => {
        headersObj[key.toLowerCase()] = value;
      });
    }
  } else {
    url = input.toString();
  }

  if (init) {
    method = init.method || method;
    signal = init.signal || signal;

    if (init.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headersObj[key.toLowerCase()] = value;
        });
      } else if (Array.isArray(init.headers)) {
        for (const [key, value] of init.headers) {
          headersObj[key.toLowerCase()] = value;
        }
      } else {
        const h = init.headers as Record<string, string>;
        for (const key of Object.keys(h)) {
          headersObj[key.toLowerCase()] = h[key];
        }
      }
    }
  }

  // Only coalesce GET requests without AbortSignal
  if (method.toUpperCase() !== 'GET') {
    return null;
  }

  if (signal) {
    return null;
  }

  // Sort headers for deterministic key
  const sortedHeaders: Record<string, string> = {};
  Object.keys(headersObj).sort().forEach(key => {
    sortedHeaders[key] = headersObj[key];
  });

  return JSON.stringify({ url, method: method.toUpperCase(), headers: sortedHeaders });
}

const originalFetch = globalThis.fetch;

globalThis.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const cacheKey = getDeterministicCacheKey(input, init);

  if (!cacheKey) {
    return originalFetch.apply(globalThis, [input, init] as any);
  }

  let entry = inFlight.get(cacheKey);

  if (entry) {
    entry.consumers++;
    return entry.promise.then(response => {
      entry!.consumers--;
      // The last consumer returns the original response to avoid memory leaks from unconsumed clone streams
      if (entry!.consumers === 0) {
        return response;
      }
      return response.clone();
    });
  }

  const promise = originalFetch.apply(globalThis, [input, init] as any).finally(() => {
    inFlight.delete(cacheKey);
  });

  entry = { promise, consumers: 1 };
  inFlight.set(cacheKey, entry);

  return promise.then(response => {
    entry!.consumers--;
    if (entry!.consumers === 0) {
      return response;
    }
    return response.clone();
  });
};
