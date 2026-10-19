const inFlight = new Map<string, Promise<Response>>();

let originalFetch: typeof globalThis.fetch;

export function installRequestCoalescer() {
  if (originalFetch) return; // Already installed

  originalFetch = globalThis.fetch;

  globalThis.fetch = async function coalescedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let method = 'GET';
    let urlStr = '';
    let hasSignal = false;
    let headersObj: Record<string, string> = {};
    let credentials = '';
    let mode = '';

    if (input instanceof Request) {
      method = input.method;
      urlStr = input.url;
      hasSignal = !!input.signal;
      credentials = input.credentials;
      mode = input.mode;
      input.headers.forEach((val, key) => {
        headersObj[key] = val;
      });
    } else if (input instanceof URL) {
      urlStr = input.href;
    } else {
      urlStr = String(input);
    }

    if (init) {
      if (init.method) method = init.method;
      if (init.signal) hasSignal = true;
      if (init.credentials) credentials = init.credentials;
      if (init.mode) mode = init.mode;
      if (init.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((val, key) => {
            headersObj[key] = val;
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, val]) => {
            headersObj[key] = val;
          });
        } else {
          Object.assign(headersObj, init.headers);
        }
      }
    }

    // Only coalesce GET requests.
    // If request has an abort signal, we bypass coalescing to avoid complex reference-counted abortion.
    if (method.toUpperCase() !== 'GET' || hasSignal) {
      return originalFetch.call(globalThis, input, init);
    }

    // Serialize headers cleanly for cache key
    const sortedHeaders = Object.keys(headersObj).sort().map(k => `${k}:${headersObj[k]}`);

    const cacheKeyObj = {
      url: urlStr,
      credentials,
      mode,
      headers: sortedHeaders
    };

    const cacheKey = JSON.stringify(cacheKeyObj);

    if (inFlight.has(cacheKey)) {
      console.log(`[Phantom] Coalescing request for ${urlStr}`);
      const promise = inFlight.get(cacheKey)!;
      return promise.then(res => res.clone());
    }

    const promise = originalFetch.call(globalThis, input, init)
      .finally(() => {
        inFlight.delete(cacheKey);
      });

    inFlight.set(cacheKey, promise);

    return promise.then(res => res.clone());
  };
}
