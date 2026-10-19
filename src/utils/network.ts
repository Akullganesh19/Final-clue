export function setupRequestCoalescing() {
  const originalFetch = globalThis.fetch;
  if (!originalFetch) return;

  const inFlight = new Map<string, { promise: Promise<Response>; count: number; resolvedCount: number }>();

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let method = 'GET';
    let headersObj: Record<string, string> = {};
    let hasSignal = false;
    let urlStr = '';

    if (typeof Request !== 'undefined' && input instanceof Request) {
      method = input.method || 'GET';
      input.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
      if (input.signal) hasSignal = true;
      urlStr = input.url;
    } else {
      urlStr = input.toString();
      if (init) {
        method = init.method || 'GET';
        if (init.headers) {
          if (init.headers instanceof Headers) {
            init.headers.forEach((value, key) => {
              headersObj[key] = value;
            });
          } else if (Array.isArray(init.headers)) {
            init.headers.forEach(([key, value]) => {
              headersObj[key] = value;
            });
          } else {
            headersObj = { ...init.headers } as Record<string, string>;
          }
        }
        if (init.signal) hasSignal = true;
      }
    }

    if (method.toUpperCase() !== 'GET' || hasSignal) {
      return originalFetch.apply(globalThis, [input, init]);
    }

    const sortedHeadersObj: Record<string, string> = {};
    Object.keys(headersObj).sort().forEach(key => {
      sortedHeadersObj[key] = headersObj[key];
    });

    const cacheKey = JSON.stringify({ url: urlStr, method: method.toUpperCase(), headers: sortedHeadersObj });

    const existing = inFlight.get(cacheKey);
    if (existing) {
      existing.count++;
      const res = await existing.promise;
      existing.resolvedCount++;
      if (existing.resolvedCount === existing.count) {
          return res;
      }
      return res.clone();
    }

    const state = { promise: Promise.resolve(new Response()), count: 1, resolvedCount: 0 };

    state.promise = originalFetch.apply(globalThis, [input, init]).finally(() => {
        inFlight.delete(cacheKey);
    });

    inFlight.set(cacheKey, state);

    const res = await state.promise;
    state.resolvedCount++;
    if (state.resolvedCount === state.count) {
        return res;
    }
    return res.clone();
  };
}
