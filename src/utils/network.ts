/**
 * Phantom Invisible Infrastructure: Network Optimizer
 * - Request Coalescing: Identical in-flight requests share a single underlying fetch.
 * - Stale-While-Revalidate (SWR) Caching: Repeated requests are served instantly from memory,
 *   with background revalidation to keep data fresh.
 */

// Secure the native fetch upon module load to prevent infinite recursion
const nativeFetch = globalThis.fetch;

interface CacheEntry {
  responseClone: Response;
  timestamp: number;
}

export function setupNetworkOptimizer() {
  const inFlight = new Map<string, Promise<Response>>();
  const cache = new Map<string, CacheEntry>();

  // Configuration
  const STALE_TTL_MS = 10000; // Time before a cached response is considered stale and needs background revalidation
  const EVICTION_TTL_MS = 60000; // Absolute time before a cache entry is removed entirely

  function wrapWithAbort(promise: Promise<Response>, signal: AbortSignal | null | undefined): Promise<Response> {
    if (!signal) return promise.then(res => res.clone());

    return new Promise((resolve, reject) => {
      const onAbort = () => reject(new DOMException('Aborted', 'AbortError'));

      if (signal.aborted) {
        onAbort();
        return;
      }

      signal.addEventListener('abort', onAbort, { once: true });

      promise
        .then(res => {
          signal.removeEventListener('abort', onAbort);
          if (!signal.aborted) resolve(res.clone());
        })
        .catch(err => {
          signal.removeEventListener('abort', onAbort);
          if (!signal.aborted) reject(err);
        });
    });
  }

  globalThis.fetch = async function optimizedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const isRequest = typeof Request !== 'undefined' && input instanceof Request;

    // Safely extract method
    const method = (init?.method || (isRequest ? (input as Request).method : 'GET')).toUpperCase();
    if (method !== 'GET') {
      return nativeFetch(input, init);
    }

    // Safely extract cache policy
    const cachePolicy = init?.cache || (isRequest ? (input as Request).cache : 'default');
    if (
      cachePolicy === 'no-store' ||
      cachePolicy === 'reload' ||
      cachePolicy === 'no-cache'
    ) {
      return nativeFetch(input, init);
    }

    // Safely extract URL
    const urlStr = isRequest ? (input as Request).url : typeof input === 'string' ? input : input.toString();
    let cacheKey = urlStr;

    // Incorporate sorted headers into cache key
    const headersRecord: Record<string, string> = {};
    if (isRequest) {
      (input as Request).headers.forEach((value, key) => { headersRecord[key] = value; });
    }
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => { headersRecord[key] = value; });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => { headersRecord[key] = value; });
      } else {
        Object.assign(headersRecord, init.headers);
      }
    }

    const sortedKeys = Object.keys(headersRecord).sort();
    const headersStr = sortedKeys.map(k => `${k}:${headersRecord[k]}`).join('|');
    if (headersStr) {
      cacheKey += `|${headersStr}`;
    }

    // Safely extract AbortSignal
    const callerSignal = init?.signal || (isRequest ? (input as Request).signal : null);

    // 1. Check Cache (Stale-While-Revalidate)
    const cachedEntry = cache.get(cacheKey);
    const now = Date.now();

    if (cachedEntry) {
      const age = now - cachedEntry.timestamp;

      if (age < STALE_TTL_MS) {
        // Fresh hit
        return wrapWithAbort(Promise.resolve(cachedEntry.responseClone), callerSignal);
      } else if (age < EVICTION_TTL_MS) {
        // Stale hit: Serve cached immediately, but trigger background revalidation
        if (!inFlight.has(cacheKey)) {
          // Fire and forget background revalidation
          performFetchAndCache(cacheKey, input, init).catch(err => {
            console.warn(`[Phantom] Background revalidation failed for ${urlStr}:`, err);
          });
        }
        return wrapWithAbort(Promise.resolve(cachedEntry.responseClone), callerSignal);
      } else {
        // Evicted hit (too old)
        cache.delete(cacheKey);
      }
    }

    // 2. Request Coalescing (In-flight deduping)
    if (inFlight.has(cacheKey)) {
      return wrapWithAbort(inFlight.get(cacheKey)!, callerSignal);
    }

    // 3. Native Fetch
    return wrapWithAbort(performFetchAndCache(cacheKey, input, init), callerSignal);
  };

  async function performFetchAndCache(cacheKey: string, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Isolate AbortController to prevent one caller from breaking coalesced requests
    const isolatedController = new AbortController();
    const isolatedInit = { ...init, signal: isolatedController.signal };

    const promise = nativeFetch(input, isolatedInit).then(res => {
      // Only cache successful GET responses
      if (res.ok) {
        const responseClone = res.clone();
        cache.set(cacheKey, {
          responseClone,
          timestamp: Date.now()
        });

        // Schedule eviction
        const timer = setTimeout(() => {
          cache.delete(cacheKey);
        }, EVICTION_TTL_MS);

        // Unref to prevent blocking Node.js exit
        if (typeof (timer as any).unref === 'function') {
          (timer as any).unref();
        }
      }
      return res;
    }).finally(() => {
      inFlight.delete(cacheKey);
    });

    inFlight.set(cacheKey, promise);
    return promise;
  }
}

// Ensure native fetch is restorable for tests
export function restoreNativeFetch() {
  globalThis.fetch = nativeFetch;
}
