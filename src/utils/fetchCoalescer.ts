const originalFetch = globalThis.fetch;
const inFlight = new Map<string, { promise: Promise<Response>, consumers: number, resolved: number }>();

function serializeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {};
  const obj: Record<string, string> = {};
  if (headers instanceof Headers) {
    headers.forEach((value, key) => { obj[key.toLowerCase()] = value; });
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => { obj[key.toLowerCase()] = value; });
  } else {
    for (const [key, value] of Object.entries(headers)) {
      obj[key.toLowerCase()] = value;
    }
  }
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Record<string, string>);
}

globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url = '';
  let method = 'GET';
  let hasSignal = false;
  let headersObj = {};

  if (typeof Request !== 'undefined' && input instanceof Request) {
    url = input.url;
    method = input.method;
    hasSignal = !!input.signal;
    headersObj = serializeHeaders(input.headers);
  } else {
    url = input.toString();
    if (init?.method) method = init.method;
    hasSignal = !!init?.signal;
    headersObj = serializeHeaders(init?.headers);
  }

  if (method.toUpperCase() !== 'GET' || hasSignal) {
    return originalFetch.apply(globalThis, [input, init]);
  }

  const cacheKey = JSON.stringify({ url, method, headers: headersObj });

  let entry = inFlight.get(cacheKey);
  if (!entry) {
    const promise = originalFetch.apply(globalThis, [input, init]).finally(() => {
      inFlight.delete(cacheKey);
    });
    entry = { promise, consumers: 0, resolved: 0 };
    inFlight.set(cacheKey, entry);
  }

  entry.consumers++;

  return entry.promise.then(response => {
    entry!.resolved++;
    // Return clone for all but the final consumer to avoid teed stream memory leaks
    if (entry!.resolved < entry!.consumers) {
      return response.clone();
    }
    return response;
  });
};

export {};
