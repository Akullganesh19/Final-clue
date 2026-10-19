const inFlight = new Map<string, Promise<Response>>();
const originalFetch = globalThis.fetch;

function normalizeHeaders(headers: HeadersInit | undefined): string {
  if (!headers) return '';
  const entries: [string, string][] = [];

  if (headers instanceof Headers) {
    headers.forEach((val, key) => entries.push([key.toLowerCase(), val]));
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, val]) => entries.push([key.toLowerCase(), val]));
  } else {
    for (const [key, val] of Object.entries(headers)) {
      entries.push([key.toLowerCase(), val]);
    }
  }

  return entries.sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join(',');
}

function getCacheKey(url: string | URL | Request, options?: RequestInit): string {
  let urlString = '';
  let headersInit: HeadersInit | undefined;

  if (url instanceof Request) {
    urlString = url.url;
    headersInit = url.headers;
  } else {
    urlString = url.toString();
  }

  if (options?.headers) {
    headersInit = options.headers;
  }

  const headerString = normalizeHeaders(headersInit);
  return `${urlString}|${headerString}`;
}

export async function dedupedFetch(url: string | URL | Request, options?: RequestInit): Promise<Response> {
  const method = options?.method?.toUpperCase() || (url instanceof Request ? url.method.toUpperCase() : 'GET');

  // Only coalesce GET requests. Caching is removed to respect HTTP semantics
  // and prevent stale UI/data leakages without complex Cache-Control parsing.
  if (method !== 'GET') {
    return originalFetch(url, options);
  }

  // Bail out of coalescing for explicitly stream-like or SSE requests
  let headersInit: HeadersInit | undefined = options?.headers || (url instanceof Request ? url.headers : undefined);
  const normalizedHeadersStr = normalizeHeaders(headersInit);
  if (normalizedHeadersStr.includes('text/event-stream')) {
    return originalFetch(url, options);
  }

  const cacheKey = getCacheKey(url, options);
  const inFlightKey = `GET:${cacheKey}`;

  if (!inFlight.has(inFlightKey)) {
    const fetchPromise = originalFetch(url, options);

    // We keep a separate wrapper in the map that creates fresh clones for each awaiter
    const coalescer = fetchPromise.then(res => res.clone());
    inFlight.set(inFlightKey, coalescer);

    fetchPromise.finally(() => {
      inFlight.delete(inFlightKey);
    });

    return fetchPromise;
  }

  // Subsequent coalesced callers await the inFlight promise and clone it AGAIN
  // so they get their own readable stream.
  const inFlightResponse = await inFlight.get(inFlightKey)!;
  return inFlightResponse.clone();
}
