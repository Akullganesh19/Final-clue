const nativeFetch = globalThis.fetch;

interface CacheEntry {
  response: Response;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 1000; // 1 minute
const MAX_CACHE_SIZE = 100;

class ApiCache {
  public cache: Map<string, CacheEntry> = new Map();

  get(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, response: Response) {
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
          this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { response, timestamp: Date.now() });

    // Auto cleanup
    const timer = setTimeout(() => {
      this.cache.delete(key);
    }, CACHE_TTL_MS + 1000);

    (timer as any).unref?.();
  }
}

export const apiCache = new ApiCache();
export const inFlightRequests = new Map<string, Promise<Response>>();

async function generateCacheKey(input: RequestInfo | URL, init?: RequestInit): Promise<string> {
  const isRequest = input instanceof Request;
  const method = init?.method || (isRequest ? input.method : 'GET');
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (method !== 'GET') {
    return `${method}:${url}`;
  }

  let headersStr = '';
  const mergedHeaders = new Headers();
  if (isRequest) {
    input.headers.forEach((value, key) => mergedHeaders.set(key, value));
  }
  if (init?.headers) {
    const initHeaders = new Headers(init.headers as HeadersInit);
    initHeaders.forEach((value, key) => mergedHeaders.set(key, value));
  }

  const sortedHeaders: Record<string, string> = {};
  mergedHeaders.forEach((value, key) => {
    sortedHeaders[key] = value;
  });
  headersStr = JSON.stringify(sortedHeaders);

  return `${method}:${url}:${headersStr}`;
}

export function setupGlobalFetchInterceptor() {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const isRequest = input instanceof Request;
    const resolvedInit = { ...init };
    // Bypassing logic checks Request object properties as well
    const cacheHeader = resolvedInit.cache || (isRequest ? input.cache : undefined);

    // 1. Bypass logic
    if (cacheHeader === 'no-store' || cacheHeader === 'reload' || cacheHeader === 'no-cache') {
      return nativeFetch(input, resolvedInit);
    }

    const method = resolvedInit.method || (isRequest ? input.method : 'GET');
    if (method !== 'GET') {
      return nativeFetch(input, resolvedInit);
    }

    const cacheKey = await generateCacheKey(input, resolvedInit);

    // Extract abort signal (from Request or Init) for caller isolation
    const callerSignal = resolvedInit.signal || (isRequest ? input.signal : undefined);

    // 2. Check Cache
    const cachedEntry = apiCache.get(cacheKey);
    if (cachedEntry) {
        const age = Date.now() - cachedEntry.timestamp;
        const isStale = age > (CACHE_TTL_MS * 0.8); // Consider stale after 80% of TTL

        if (isStale) {
             // Background revalidate
             // Clone the input if it's a request to avoid stream lock errors during revalidation
             const inputForRevalidate = isRequest ? input.clone() : input;
             revalidate(inputForRevalidate, resolvedInit, cacheKey).catch(console.error);
        }
        return cachedEntry.response.clone();
    }

    // 3. Request Coalescing
    if (inFlightRequests.has(cacheKey)) {
        const inFlightPromise = inFlightRequests.get(cacheKey)!;

        // Handle abort signal for this specific caller
        if (callerSignal) {
            return new Promise((resolve, reject) => {
                const abortHandler = () => {
                    reject(new DOMException('Aborted', 'AbortError'));
                };
                callerSignal.addEventListener('abort', abortHandler);

                inFlightPromise.then((res) => {
                    callerSignal.removeEventListener('abort', abortHandler);
                    resolve(res.clone());
                }).catch((err) => {
                    callerSignal.removeEventListener('abort', abortHandler);
                    reject(err);
                });
            });
        }

        const res = await inFlightPromise;
        return res.clone();
    }

    // 4. Actual Fetch
    const controller = new AbortController();

    // When doing the native fetch, strip out the user's signal
    // so one user aborting doesn't cancel it for everyone coalescing,
    // and pass our isolated controller.signal
    const isolatedInit = { ...resolvedInit, signal: controller.signal };

    const fetchPromise = nativeFetch(input, isolatedInit).then(async (response) => {
      if (response.ok) {
        apiCache.set(cacheKey, response.clone());
      }
      return response;
    }).finally(() => {
      inFlightRequests.delete(cacheKey);
    });

    inFlightRequests.set(cacheKey, fetchPromise);

    // Handle caller abort
    if (callerSignal) {
        return new Promise((resolve, reject) => {
             const abortHandler = () => {
                 reject(new DOMException('Aborted', 'AbortError'));
             };
             callerSignal.addEventListener('abort', abortHandler);

             fetchPromise.then((res) => {
                 callerSignal.removeEventListener('abort', abortHandler);
                 resolve(res.clone());
             }).catch((err) => {
                 callerSignal.removeEventListener('abort', abortHandler);
                 reject(err);
             });
        });
    }

    const res = await fetchPromise;
    return res.clone();
  };
}

async function revalidate(input: RequestInfo | URL, init: RequestInit | undefined, cacheKey: string) {
    if (inFlightRequests.has(cacheKey)) return; // Already revalidating

    // Create an isolated init without any abort signals from the original caller
    // So if the caller aborts immediately, background revalidation still finishes
    const isolatedInit = { ...init };
    delete isolatedInit.signal;

    const fetchPromise = nativeFetch(input, isolatedInit).then(async (response) => {
        if (response.ok) {
            apiCache.set(cacheKey, response.clone());
        }
        return response;
    }).catch((e) => {
        // Ignore revalidation errors, but return a rejected promise so it doesn't get stuck if awaited
        throw e;
    }).finally(() => {
       inFlightRequests.delete(cacheKey);
    });

    // Coalesce the background revalidation request too
    inFlightRequests.set(cacheKey, fetchPromise);
}
