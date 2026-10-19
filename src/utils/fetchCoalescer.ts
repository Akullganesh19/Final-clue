interface CoalescedRequest {
  promise: Promise<Response>;
  totalConsumers: number;
  resolvedConsumers: number;
}

const inFlight = new Map<string, CoalescedRequest>();

export function setupFetchCoalescing() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let method = init?.method || 'GET';
    let signal = init?.signal;
    let headersObj: Record<string, string> = {};

    if (typeof Request !== 'undefined' && input instanceof Request) {
      method = input.method || method;
      signal = input.signal || signal;
      input.headers.forEach((value, key) => { headersObj[key] = value; });
    }

    if (init?.headers) {
      const h = new Headers(init.headers);
      h.forEach((value, key) => { headersObj[key] = value; });
    }

    if (method.toUpperCase() !== 'GET' || signal) {
      return originalFetch.apply(globalThis, [input, init]);
    }

    let urlStr = '';
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input instanceof URL) {
      urlStr = input.toString();
    } else if (typeof Request !== 'undefined' && input instanceof Request) {
      urlStr = input.url;
    }

    const sortedKeys = Object.keys(headersObj).sort();
    const sortedHeaders: Record<string, string> = {};
    for (const key of sortedKeys) {
      sortedHeaders[key] = headersObj[key];
    }
    const cacheKey = JSON.stringify({ url: urlStr, headers: sortedHeaders });

    if (inFlight.has(cacheKey)) {
      const req = inFlight.get(cacheKey)!;
      req.totalConsumers++;
      return req.promise.then(res => {
        req.resolvedConsumers++;
        if (req.resolvedConsumers === req.totalConsumers) {
          return res; // Final consumer gets original
        }
        return res.clone();
      });
    }

    const promise = originalFetch.apply(globalThis, [input, init]).finally(() => {
      inFlight.delete(cacheKey);
    });

    const req = {
      promise,
      totalConsumers: 1,
      resolvedConsumers: 0
    };

    inFlight.set(cacheKey, req);

    const res = await promise;
    req.resolvedConsumers++;
    if (req.resolvedConsumers === req.totalConsumers) {
       return res;
    }
    return res.clone();
  };
}
