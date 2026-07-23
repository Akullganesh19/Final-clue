const originalFetch = globalThis.fetch;
const inFlight = new Map<string, { promise: Promise<Response>, consumers: number, resolved: number }>();

globalThis.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
  let method = init?.method || 'GET';
  let urlStr = '';
  let headersObj: Record<string, string> = {};
  let signal = init?.signal;

  if (typeof Request !== 'undefined' && input instanceof Request) {
    method = input.method;
    urlStr = input.url;
    signal = input.signal || signal;
    if (input.headers) {
      input.headers.forEach((value, key) => { headersObj[key.toLowerCase()] = value; });
    }
  } else if (input instanceof URL) {
    urlStr = input.href;
  } else {
    urlStr = input as string;
  }

  if (init?.headers) {
    const h = new Headers(init.headers);
    h.forEach((value, key) => { headersObj[key.toLowerCase()] = value; });
  }

  if (method.toUpperCase() !== 'GET' || signal) {
    return originalFetch.apply(globalThis, [input as RequestInfo, init]);
  }

  const sortedHeaders = Object.keys(headersObj).sort().reduce((acc, key) => {
    acc[key] = headersObj[key];
    return acc;
  }, {} as Record<string, string>);

  const cacheKey = JSON.stringify({ url: urlStr, headers: sortedHeaders });

  if (inFlight.has(cacheKey)) {
    const record = inFlight.get(cacheKey)!;
    record.consumers++;
    return record.promise.then(res => {
      record.resolved++;
      if (record.resolved === record.consumers) {
        inFlight.delete(cacheKey);
        return res;
      }
      return res.clone();
    });
  }

  const fetchPromise = originalFetch.apply(globalThis, [input as RequestInfo, init]).catch(err => {
    inFlight.delete(cacheKey);
    throw err;
  });

  inFlight.set(cacheKey, { promise: fetchPromise, consumers: 1, resolved: 0 });

  return fetchPromise.then(res => {
    const record = inFlight.get(cacheKey);
    if (record) {
      record.resolved++;
      if (record.resolved === record.consumers) {
        inFlight.delete(cacheKey);
        return res;
      }
      return res.clone();
    }
    return res;
  });
};
