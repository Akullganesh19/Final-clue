const originalFetch = globalThis.fetch;

interface CoalescedRequest {
  promise: Promise<Response>;
  clonesNeeded: number;
}

const inFlightRequests = new Map<string, CoalescedRequest>();

function generateCacheKey(input: RequestInfo | URL, init?: RequestInit): string {
  let url = '';
  let headersObj: Record<string, string> = {};
  let credentials = init?.credentials || 'omit';
  let mode = init?.mode || 'cors';

  if (typeof Request !== 'undefined' && input instanceof Request) {
    url = input.url;
    input.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    credentials = input.credentials || credentials;
    mode = input.mode || mode;
  } else if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  }

  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      for (const [key, value] of init.headers) {
        headersObj[key] = value;
      }
    } else {
      for (const key in init.headers) {
        headersObj[key] = (init.headers as Record<string, string>)[key];
      }
    }
  }

  // Sort headers for deterministic key generation
  const sortedHeaders: Record<string, string> = {};
  Object.keys(headersObj).sort().forEach(k => {
    sortedHeaders[k] = headersObj[k];
  });

  const keyObj = {
    url,
    headers: sortedHeaders,
    credentials,
    mode
  };

  return JSON.stringify(keyObj);
}

export function installRequestCoalescer() {
  globalThis.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let method = init?.method || 'GET';
    let signal = init?.signal;
    let urlString = '';

    if (typeof Request !== 'undefined' && input instanceof Request) {
      method = init?.method || input.method || 'GET';
      signal = init?.signal || input.signal;
      urlString = input.url;
    } else if (typeof input === 'string') {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.toString();
    }

    if (method.toUpperCase() !== 'GET' || signal) {
      return originalFetch.apply(globalThis, [input, init]);
    }

    const cacheKey = generateCacheKey(input, init);

    const activeReq = inFlightRequests.get(cacheKey);

    if (activeReq) {
      console.warn(`[Phantom] Coalescing concurrent request to: ${urlString}`);
      activeReq.clonesNeeded++;

      try {
        const response = await activeReq.promise;
        activeReq.clonesNeeded--;

        if (activeReq.clonesNeeded > 0) {
           return response.clone();
        } else {
           return response;
        }
      } catch (err) {
        throw err;
      }
    }

    const dist: CoalescedRequest = { promise: null as any, clonesNeeded: 0 };
    inFlightRequests.set(cacheKey, dist);

    const promise = originalFetch.apply(globalThis, [input, init]).finally(() => {
      // Only delete if it is STILL this specific request instance
      if (inFlightRequests.get(cacheKey) === dist) {
        inFlightRequests.delete(cacheKey);
      }
    });

    dist.promise = promise;

    try {
      const response = await promise;
      if (dist.clonesNeeded > 0) {
        return response.clone();
      } else {
        return response;
      }
    } catch (err) {
      throw err;
    }
  };
}
