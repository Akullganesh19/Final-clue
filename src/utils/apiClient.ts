const nativeFetch = globalThis.fetch;

const MAX_CACHE_SIZE = 100;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  promise: Promise<Response>;
  timer: ReturnType<typeof setTimeout>;
}

const cache = new Map<string, CacheEntry>();

function getHeadersObj(headers?: HeadersInit): Record<string, string> {
  const obj: Record<string, string> = {};
  if (!headers) return obj;
  const h = new Headers(headers);
  h.forEach((v, k) => { obj[k] = v; });
  return obj;
}

function createAbortError() {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('Aborted', 'AbortError');
  }
  const err = new Error('Aborted');
  err.name = 'AbortError';
  return err;
}

export async function dedupedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let urlStr = '';
  let method = 'GET';
  let cacheMode: RequestCache | undefined = init?.cache;
  let headersObj: Record<string, string> = {};
  let signal: AbortSignal | null | undefined = init?.signal;

  if (input instanceof Request) {
    urlStr = input.url;
    method = input.method.toUpperCase();
    if (!init?.cache) cacheMode = input.cache;
    Object.assign(headersObj, getHeadersObj(input.headers));
    if (init?.signal === undefined) signal = input.signal;
  } else {
    urlStr = input.toString();
    method = (init?.method || 'GET').toUpperCase();
  }

  if (init?.headers) {
    Object.assign(headersObj, getHeadersObj(init.headers));
  }

  // Bypass cache if explicit directives demand it
  if (cacheMode === 'no-store' || cacheMode === 'reload' || cacheMode === 'no-cache') {
    return nativeFetch(input, init);
  }

  // Only cache/coalesce idempotent methods
  if (method !== 'GET' && method !== 'HEAD') {
    return nativeFetch(input, init);
  }

  // Create a stable cache key based on URL, method, and headers
  const sortedHeaders: Record<string, string> = {};
  Object.keys(headersObj).sort().forEach(k => {
    sortedHeaders[k] = headersObj[k];
  });

  const cacheKey = JSON.stringify([method, urlStr, sortedHeaders]);

  let coalescedPromise: Promise<Response>;

  if (cache.has(cacheKey)) {
    coalescedPromise = cache.get(cacheKey)!.promise;
  } else {
    // FIFO Eviction
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        const entry = cache.get(firstKey);
        if (entry) {
          clearTimeout(entry.timer);
          cache.delete(firstKey);
        }
      }
    }

    // Strip signal from the native fetch to prevent one caller from aborting for everyone
    // Use a fresh AbortController to ensure there's no signal overriding issue
    const dummyController = new AbortController();
    const fetchInit: RequestInit = { ...init, signal: dummyController.signal };

    const promise = nativeFetch(input, fetchInit).then((response) => {
      return response;
    }).catch((error) => {
      const entry = cache.get(cacheKey);
      if (entry) {
          clearTimeout(entry.timer);
          cache.delete(cacheKey);
      }
      throw error;
    });

    const timer = setTimeout(() => {
      cache.delete(cacheKey);
    }, TTL_MS);

    if (typeof (timer as any).unref === 'function') {
      (timer as any).unref();
    }

    cache.set(cacheKey, { promise, timer });
    coalescedPromise = promise;
  }

  return new Promise((resolve, reject) => {
    // Handle individual abort signal
    if (signal) {
      if (signal.aborted) {
        return reject(createAbortError());
      }
      const abortHandler = () => {
        reject(createAbortError());
      };
      signal.addEventListener('abort', abortHandler, { once: true });
      coalescedPromise.then(res => {
        signal!.removeEventListener('abort', abortHandler);
        resolve(res.clone());
      }).catch(err => {
        signal!.removeEventListener('abort', abortHandler);
        reject(err);
      });
    } else {
      coalescedPromise.then(res => resolve(res.clone())).catch(reject);
    }
  });
}

// Globally intercept fetch
globalThis.fetch = dedupedFetch as any;
