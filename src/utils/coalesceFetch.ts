/**
 * Request Coalescing Infrastructure
 *
 * Intercepts global fetch and groups identical in-flight GET requests together.
 * If 10 components fetch the same URL at the same time, only 1 network request is made.
 */

const originalFetch = globalThis.fetch;
const inFlightRequests = new Map<string, { promise: Promise<Response>; consumers: number }>();

function generateDeterministicCacheKey(input: RequestInfo | URL, init?: RequestInit): string | null {
  try {
    let method = 'GET';
    let url = '';
    const headersObj: Record<string, string> = {};

    if (typeof Request !== 'undefined' && input instanceof Request) {
      method = input.method || 'GET';
      url = input.url;
      if (input.headers) {
        input.headers.forEach((value, key) => {
          headersObj[key.toLowerCase()] = value;
        });
      }
    } else {
      url = input.toString();
    }

    if (init) {
      if (init.method) method = init.method;
      if (init.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => {
             headersObj[key.toLowerCase()] = value;
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => {
            headersObj[key.toLowerCase()] = value;
          });
        } else {
          Object.entries(init.headers).forEach(([key, value]) => {
            headersObj[key.toLowerCase()] = String(value);
          });
        }
      }
    }

    if (method.toUpperCase() !== 'GET') {
      return null;
    }

    // Sort headers for deterministic key
    const sortedHeaders: Record<string, string> = {};
    Object.keys(headersObj).sort().forEach(key => {
      sortedHeaders[key] = headersObj[key];
    });

    return JSON.stringify({ url, method: method.toUpperCase(), headers: sortedHeaders });
  } catch (e) {
    return null;
  }
}

globalThis.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Graceful degradation: skip if AbortSignal is present
  const hasSignal = (typeof Request !== 'undefined' && input instanceof Request && input.signal) || (init && init.signal);

  if (hasSignal) {
     return originalFetch.apply(globalThis, [input, init]);
  }

  // Skip if there's a body
  const hasBody = (typeof Request !== 'undefined' && input instanceof Request && input.body) || (init && init.body);
  if (hasBody) {
     return originalFetch.apply(globalThis, [input, init]);
  }

  const cacheKey = generateDeterministicCacheKey(input, init);

  if (!cacheKey) {
    return originalFetch.apply(globalThis, [input, init]);
  }

  let inFlight = inFlightRequests.get(cacheKey);

  if (!inFlight) {
    const promise = originalFetch.apply(globalThis, [input, init]).finally(() => {
      inFlightRequests.delete(cacheKey);
    });

    inFlight = { promise, consumers: 0 };
    inFlightRequests.set(cacheKey, inFlight);
  }

  inFlight.consumers++;

  const response = await inFlight.promise;

  inFlight.consumers--;

  if (inFlight.consumers > 0) {
    return response.clone();
  }

  return response;
};
