const nativeFetch = globalThis.fetch;

const MAX_CACHE_SIZE = 100;
const TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  responsePromise: Promise<Response>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<Response>>();

function getMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init && init.method) {
    return init.method.toUpperCase();
  }
  if (input instanceof Request) {
    return input.method.toUpperCase();
  }
  return 'GET';
}

function getCacheParam(input: RequestInfo | URL, init?: RequestInit): string | undefined {
  if (init && init.cache) {
    return init.cache;
  }
  if (input instanceof Request) {
    return input.cache;
  }
  return undefined;
}

function generateCacheKey(input: RequestInfo | URL, init?: RequestInit): string {
  let urlStr = '';
  const headers = new Headers();

  if (typeof input === 'string') {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (input instanceof Request) {
    urlStr = input.url;
    input.headers.forEach((value, key) => headers.append(key, value));
  }

  if (init && init.headers) {
    const initHeaders = new Headers(init.headers);
    initHeaders.forEach((value, key) => headers.set(key, value));
  }

  const sortedHeaders = Array.from(headers.entries()).sort(([a], [b]) => a.localeCompare(b));
  return `${urlStr}|${JSON.stringify(sortedHeaders)}`;
}

function attachAbortSignal(promise: Promise<Response>, signal?: AbortSignal | null): Promise<Response> {
  if (!signal) return promise;

  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      return reject(err);
    }

    const abortHandler = () => {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      reject(err);
    };

    signal.addEventListener('abort', abortHandler);

    promise.then(
      (res) => {
        signal.removeEventListener('abort', abortHandler);
        resolve(res);
      },
      (err) => {
        signal.removeEventListener('abort', abortHandler);
        reject(err);
      }
    );
  });
}

export function dedupedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = getMethod(input, init);
  const cacheParam = getCacheParam(input, init);

  const isIdempotent = method === 'GET' || method === 'HEAD';
  const noCache = cacheParam === 'no-store' || cacheParam === 'reload' || cacheParam === 'no-cache';

  if (!isIdempotent || noCache) {
    return nativeFetch(input, init);
  }

  const cacheKey = generateCacheKey(input, init);
  const now = Date.now();
  const cached = cache.get(cacheKey);

  const fetchFresh = () => {
    if (inFlight.has(cacheKey)) {
      return inFlight.get(cacheKey)!;
    }

    const internalController = new AbortController();
    const internalInit = { ...init, signal: internalController.signal };

    const fetchPromise = nativeFetch(input, internalInit)
      .then(response => {
        if (response.ok || response.status === 304) {
          if (cache.size >= MAX_CACHE_SIZE) {
            const firstKey = cache.keys().next().value;
            if (firstKey) cache.delete(firstKey);
          }
          cache.set(cacheKey, {
            responsePromise: Promise.resolve(response.clone()),
            timestamp: Date.now()
          });

          const timer = setTimeout(() => {
            cache.delete(cacheKey);
          }, TTL_MS);
          (timer as any).unref?.();
        }
        return response;
      })
      .finally(() => {
        inFlight.delete(cacheKey);
      });

    inFlight.set(cacheKey, fetchPromise);
    return fetchPromise;
  };

  if (cached) {
    if (now - cached.timestamp < TTL_MS) {
      // Stale-while-revalidate pattern: return cached immediately, fetch fresh in background
      fetchFresh().catch(() => {}); // ignore background fetch errors
      return attachAbortSignal(cached.responsePromise.then(res => res.clone()), init?.signal);
    } else {
      cache.delete(cacheKey);
    }
  }

  if (inFlight.has(cacheKey)) {
    return attachAbortSignal(inFlight.get(cacheKey)!.then(res => res.clone()), init?.signal);
  }

  return attachAbortSignal(fetchFresh().then(res => res.clone()), init?.signal);
}

export function setupGlobalFetchInterceptor() {
  globalThis.fetch = dedupedFetch;
}
