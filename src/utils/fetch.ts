const nativeFetch = globalThis.fetch;

interface CacheEntry {
  response: Response;
  timestamp: number;
}

const CACHE_TTL = 60 * 1000; // 60 seconds
const inFlight = new Map<string, Promise<Response>>();
const cache = new Map<string, CacheEntry>();

function getCacheKey(url: string, init?: RequestInit): string {
  if (!init || !init.headers) return url;

  const headers = new Headers(init.headers);
  const sortedHeaders = Array.from(headers.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');

  return `${url}|${sortedHeaders}`;
}

export const coalescedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url = '';
  let method = 'GET';
  let headers: HeadersInit | undefined;
  let signal: AbortSignal | null | undefined;

  if (typeof Request !== 'undefined' && input instanceof Request) {
    url = input.url;
    method = input.method;
    headers = input.headers;
    signal = input.signal;

    // Merge init properties if provided
    if (init) {
      if (init.method) method = init.method;
      if (init.headers) {
        // Merge headers
        const mergedHeaders = new Headers(headers);
        new Headers(init.headers).forEach((value, key) => {
          mergedHeaders.set(key, value);
        });
        headers = mergedHeaders;
      }
      if (init.signal !== undefined) signal = init.signal;
    }
  } else {
    url = input.toString();
    if (init) {
      method = init.method || 'GET';
      headers = init.headers;
      signal = init.signal;
    }
  }

  // Reconstruct init for native fetch and caching
  const effectiveInit: RequestInit = { ...init, method, headers };

  const cacheBypass = init?.cache === 'no-store' || init?.cache === 'reload' || init?.cache === 'no-cache';

  // Only GET requests are cached and coalesced
  if (method.toUpperCase() !== 'GET' || cacheBypass) {
    return nativeFetch(input, init);
  }

  const cacheKey = getCacheKey(url, effectiveInit);
  const cached = cache.get(cacheKey);

  if (cached) {
    const isStale = Date.now() - cached.timestamp > CACHE_TTL;
    if (isStale && !inFlight.has(cacheKey)) {
      // Background revalidate
      fetchAndCache(input, effectiveInit, cacheKey).catch(e => {
        console.warn('Background revalidation failed:', e);
      });
    }
    return cached.response.clone();
  }

  if (inFlight.has(cacheKey)) {
    const promise = inFlight.get(cacheKey)!;
    return new Promise((resolve, reject) => {
      if (signal) {
        if (signal.aborted) {
          return reject(signal.reason);
        }
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      }
      promise.then(res => resolve(res.clone())).catch(reject);
    });
  }

  return fetchAndCache(input, effectiveInit, cacheKey, signal);
};

async function fetchAndCache(
  input: RequestInfo | URL,
  init: RequestInit,
  cacheKey: string,
  callerSignal?: AbortSignal | null
): Promise<Response> {
  const nativeController = new AbortController();
  const fetchInit = { ...init, signal: nativeController.signal };

  if (typeof Request !== 'undefined' && input instanceof Request) {
    // Rebuild the request with the new signal
    input = new Request(input, fetchInit);
  }

  const promise = nativeFetch(input, fetchInit)
    .then(response => {
      // Only cache successful responses
      if (response.ok) {
        cache.set(cacheKey, {
          response: response.clone(),
          timestamp: Date.now()
        });
      }
      return response;
    })
    .finally(() => {
      inFlight.delete(cacheKey);
    });

  inFlight.set(cacheKey, promise);

  return new Promise((resolve, reject) => {
    if (callerSignal) {
      if (callerSignal.aborted) {
        return reject(callerSignal.reason);
      }
      callerSignal.addEventListener('abort', () => reject(callerSignal.reason), { once: true });
    }
    promise.then(res => resolve(res.clone())).catch(reject);
  });
}

// Global override
globalThis.fetch = coalescedFetch;
