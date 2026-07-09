const cache = new Map<string, { timestamp: number; response: Response }>();
const inFlight = new Map<string, Promise<Response>>();

const TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

function generateCacheKey(url: string | URL | Request, init?: RequestInit): string {
  let key = url instanceof Request ? url.url : url.toString();

  let headersToHash = null;
  if (init?.headers) {
    headersToHash = init.headers;
  } else if (url instanceof Request && url.headers) {
    headersToHash = url.headers;
  }

  if (headersToHash) {
    if (headersToHash instanceof Headers) {
      const entries = Array.from(headersToHash.entries()).sort();
      key += '|' + entries.map(([k, v]) => `${k}:${v}`).join(',');
    } else if (Array.isArray(headersToHash)) {
        const entries = [...headersToHash].sort((a, b) => a[0].localeCompare(b[0]));
        key += '|' + entries.map(([k, v]) => `${k}:${v}`).join(',');
    } else {
      const entries = Object.entries(headersToHash).sort();
      key += '|' + entries.map(([k, v]) => `${k}:${v}`).join(',');
    }
  }
  return key;
}

// Store the original fetch securely upon module load so that overriding globalThis.fetch
// in the entry point (e.g. main.tsx) doesn't cause infinite recursion when we call it here.
const nativeFetch = globalThis.fetch;

export function dedupedFetch(url: string | URL | Request, init?: RequestInit): Promise<Response> {
  const method = init?.method?.toUpperCase() || (url instanceof Request ? url.method.toUpperCase() : 'GET');

  if (method !== 'GET' && method !== 'HEAD') {
    return nativeFetch(url, init);
  }

  const key = generateCacheKey(url, init);

  // Check if we should bypass the cache
  const shouldBypassCache = init?.cache === 'no-cache' || init?.cache === 'no-store' || init?.cache === 'reload';

  if (!shouldBypassCache) {
    const cached = cache.get(key);
    if (cached) {
      if (Date.now() - cached.timestamp < TTL) {
        return Promise.resolve(cached.response.clone());
      } else {
        // Stale entry, but we can return it while revalidating in the background (stale-while-revalidate)
        // Fire off a background fetch to update the cache
        nativeFetch(url, init).then(res => {
            if (res.ok) {
                cache.set(key, { timestamp: Date.now(), response: res.clone() });
            }
        }).catch(() => { /* silent background error */ });

        return Promise.resolve(cached.response.clone());
      }
    }
  }

  if (inFlight.has(key)) {
    return inFlight.get(key)!.then(res => res.clone());
  }

  const promise = nativeFetch(url, init)
    .then(res => {
      if (res.ok && !shouldBypassCache) {
        if (cache.size >= MAX_CACHE_SIZE) {
          const firstKey = cache.keys().next().value;
          if (firstKey !== undefined) {
            cache.delete(firstKey);
          }
        }
        cache.set(key, {
          timestamp: Date.now(),
          response: res.clone()
        });
      }
      return res;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);

  return promise.then(res => res.clone());
}
