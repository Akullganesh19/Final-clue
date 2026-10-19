const inFlight = new Map<string, {
  promise: Promise<Response>;
  consumers: number;
  resolvedConsumers: number;
}>();

const originalFetch = globalThis.fetch;

const extractHeaders = (h?: HeadersInit): Record<string, string> => {
  if (!h) return {};
  if (typeof Headers !== 'undefined' && h instanceof Headers) {
    const obj: Record<string, string> = {};
    h.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  if (Array.isArray(h)) {
    const obj: Record<string, string> = {};
    h.forEach(([key, value]) => {
      obj[key] = value;
    });
    return obj;
  }
  return h as Record<string, string>;
};

export const interceptFetch = () => {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let method = 'GET';
    let signal: AbortSignal | undefined;
    let url = '';
    let headersObj: Record<string, string> = {};
    let extractedInit: Record<string, any> = {};

    if (typeof Request !== 'undefined' && input instanceof Request) {
      method = input.method;
      signal = input.signal;
      url = input.url;
      headersObj = extractHeaders(input.headers);

      // Request might have other properties we'd want to track, but for coalescing
      // GETs, headers and url are the most important.
    } else {
      url = input.toString();
    }

    if (init) {
      method = init.method || method;
      signal = init.signal || signal;
      headersObj = { ...headersObj, ...extractHeaders(init.headers) };
      extractedInit = { ...init };
      delete extractedInit.headers;
      delete extractedInit.signal;
      delete extractedInit.method;
    }

    if (method.toUpperCase() !== 'GET' || signal) {
      return originalFetch.apply(globalThis, [input, init]);
    }

    let cacheKey = url;
    try {
      // Sort headers to ensure consistent serialization
      const sortedHeaders = Object.keys(headersObj).sort().reduce((acc, key) => {
        acc[key] = headersObj[key];
        return acc;
      }, {} as Record<string, string>);

      cacheKey = `${url}|${JSON.stringify({
        ...extractedInit,
        headers: sortedHeaders
      })}`;
    } catch (e) {
      // Fallback
    }

    if (inFlight.has(cacheKey)) {
      const entry = inFlight.get(cacheKey)!;
      entry.consumers++;
      const response = await entry.promise;
      entry.resolvedConsumers++;
      if (entry.resolvedConsumers < entry.consumers) {
        return response.clone();
      }
      return response;
    }

    const entry = {
      promise: originalFetch.apply(globalThis, [input, init]),
      consumers: 1,
      resolvedConsumers: 0
    };

    entry.promise.finally(() => {
      if (inFlight.get(cacheKey) === entry) {
        inFlight.delete(cacheKey);
      }
    });

    inFlight.set(cacheKey, entry);

    console.warn(`[Phantom] Coalescing request initiated for ${url}`);

    const response = await entry.promise;
    entry.resolvedConsumers++;
    if (entry.resolvedConsumers < entry.consumers) {
      return response.clone();
    }
    return response;
  };
};
