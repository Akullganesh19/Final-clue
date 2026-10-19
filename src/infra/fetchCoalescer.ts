export function setupFetchCoalescer() {
  const originalFetch = globalThis.fetch;

  interface CacheKeyParams {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  }

  function extractHeaders(headers?: HeadersInit): Record<string, string> {
    const result: Record<string, string> = {};
    if (!headers) return result;

    if (typeof Headers !== 'undefined' && headers instanceof Headers) {
      headers.forEach((value, key) => {
        result[key] = value;
      });
    } else if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        result[key] = value;
      }
    } else {
      for (const key of Object.keys(headers)) {
        result[key] = (headers as Record<string, string>)[key];
      }
    }
    return result;
  }

  function generateCacheKey(input: RequestInfo | URL, init?: RequestInit): string {
    let url = '';
    let method = 'GET';
    let headersObj: Record<string, string> = {};
    let bodyStr: string | undefined;

    if (typeof Request !== 'undefined' && input instanceof Request) {
      url = input.url;
      method = input.method;
      headersObj = extractHeaders(input.headers);
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.toString();
    }

    if (init) {
      if (init.method) method = init.method;
      if (init.headers) {
        const initHeaders = extractHeaders(init.headers);
        headersObj = { ...headersObj, ...initHeaders };
      }
      if (init.body && typeof init.body === 'string') {
        bodyStr = init.body;
      }
    }

    const sortedHeaders = Object.keys(headersObj).sort().reduce((acc, key) => {
      acc[key] = headersObj[key];
      return acc;
    }, {} as Record<string, string>);

    const params: CacheKeyParams = {
      url,
      method: method.toUpperCase(),
      headers: sortedHeaders,
      ...(bodyStr ? { body: bodyStr } : {})
    };

    return JSON.stringify(params);
  }

  interface InFlightRequest {
    promise: Promise<Response>;
    consumers: number;
    resolved: number;
  }

  const inFlight = new Map<string, InFlightRequest>();

  globalThis.fetch = async function coalescedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const hasSignal = (typeof Request !== 'undefined' && input instanceof Request && input.signal) || (init && init.signal);

    const reqMethod = (init && init.method) || (typeof Request !== 'undefined' && input instanceof Request && input.method) || 'GET';
    const isSafeMethod = ['GET', 'OPTIONS'].includes(reqMethod.toUpperCase());

    if (!isSafeMethod || hasSignal) {
      return originalFetch.apply(globalThis, [input, init]);
    }

    const cacheKey = generateCacheKey(input, init);

    if (inFlight.has(cacheKey)) {
      const inFlightReq = inFlight.get(cacheKey)!;
      inFlightReq.consumers++;

      try {
        const response = await inFlightReq.promise;
        inFlightReq.resolved++;

        if (inFlightReq.resolved === inFlightReq.consumers) {
          inFlight.delete(cacheKey);
          return response;
        } else {
          return response.clone();
        }
      } catch (error) {
        inFlightReq.resolved++;
        if (inFlightReq.resolved === inFlightReq.consumers) {
          inFlight.delete(cacheKey);
        }
        throw error;
      }
    }

    let resolvePromise!: (value: Response) => void;
    let rejectPromise!: (reason: any) => void;

    const promise = new Promise<Response>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    const inFlightReq: InFlightRequest = {
      promise,
      consumers: 1,
      resolved: 0
    };

    inFlight.set(cacheKey, inFlightReq);

    try {
      const response = await originalFetch.apply(globalThis, [input, init]);
      resolvePromise(response);

      inFlightReq.resolved++;
      if (inFlightReq.resolved === inFlightReq.consumers) {
        inFlight.delete(cacheKey);
        return response;
      } else {
        return response.clone();
      }
    } catch (error) {
      rejectPromise(error);
      inFlightReq.resolved++;
      if (inFlightReq.resolved === inFlightReq.consumers) {
        inFlight.delete(cacheKey);
      }
      throw error;
    }
  };
}
