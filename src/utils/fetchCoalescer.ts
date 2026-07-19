type FetchType = typeof globalThis.fetch;

export function setupFetchCoalescing() {
  const originalFetch = globalThis.fetch;

  if ((originalFetch as any).__coalescer_installed) {
    return;
  }

  const inFlight = new Map<string, { promise: Promise<Response>, consumers: number }>();

  globalThis.fetch = function fetchCoalescer(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let url = '';
    let method = 'GET';
    let headersObj: Record<string, string> = {};
    let signal: AbortSignal | null | undefined = undefined;

    if (typeof Request !== 'undefined' && input instanceof Request) {
      url = input.url;
      method = input.method;
      signal = input.signal;

      input.headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      if (init) {
        if (init.method) method = init.method;
        if (init.signal) signal = init.signal;
        if (init.headers) {
          const initHeaders = new Headers(init.headers);
          initHeaders.forEach((value, key) => {
            headersObj[key] = value;
          });
        }
      }
    } else {
      url = input.toString();
      if (init) {
        if (init.method) method = init.method;
        if (init.signal) signal = init.signal;
        if (init.headers) {
          const initHeaders = new Headers(init.headers);
          initHeaders.forEach((value, key) => {
            headersObj[key] = value;
          });
        }
      }
    }

    if (signal) {
      return originalFetch.apply(globalThis, [input, init]);
    }

    if (method.toUpperCase() !== 'GET') {
      return originalFetch.apply(globalThis, [input, init]);
    }

    const sortedHeaderKeys = Object.keys(headersObj).sort();
    const sortedHeaders: Record<string, string> = {};
    for (const key of sortedHeaderKeys) {
      sortedHeaders[key] = headersObj[key];
    }

    const cacheKey = JSON.stringify({ url, method, headers: sortedHeaders });

    const existingInFlight = inFlight.get(cacheKey);

    if (existingInFlight) {
      console.warn(`[Phantom] Coalescing request for ${url}`);
      existingInFlight.consumers++;

      return existingInFlight.promise.then(response => {
        existingInFlight.consumers--;
        if (existingInFlight.consumers > 0) {
          return response.clone();
        }
        return response;
      });
    }

    const state = { consumers: 1, promise: Promise.resolve(new Response()) };

    const networkPromise = originalFetch.apply(globalThis, [input, init]).finally(() => {
      inFlight.delete(cacheKey);
    });

    state.promise = networkPromise;
    inFlight.set(cacheKey, state);

    return networkPromise.then(response => {
      state.consumers--;
      if (state.consumers > 0) {
        return response.clone();
      }
      return response;
    });
  } as FetchType;

  (globalThis.fetch as any).__coalescer_installed = true;
}
