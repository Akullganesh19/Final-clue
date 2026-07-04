const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  response: Response;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<Response>>();

function buildCacheKey(input: string | URL | Request, init?: RequestInit): string {
  let method = 'GET';
  let urlString = '';
  const headersObj = new Headers();

  if (input instanceof Request) {
    method = input.method;
    urlString = input.url;
    input.headers.forEach((value, key) => headersObj.append(key, value));
  } else {
    urlString = input.toString();
  }

  if (init) {
    if (init.method) method = init.method;
    if (init.headers) {
      const initHeaders = new Headers(init.headers);
      initHeaders.forEach((value, key) => headersObj.set(key, value));
    }
  }

  const headersList: string[] = [];
  headersObj.forEach((value, key) => {
    headersList.push(`${key}:${value}`);
  });
  headersList.sort();
  const headersString = headersList.join('|');

  return `${method.toUpperCase()}:${urlString}:${headersString}`;
}

export async function dedupedFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

  // Only cache and coalesce GET requests
  if (method !== 'GET') {
    return fetch(input, init);
  }

  const cacheKey = buildCacheKey(input, init);

  // Check cache
  const cachedEntry = cache.get(cacheKey);
  if (cachedEntry) {
    if (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      return cachedEntry.response.clone();
    } else {
      cache.delete(cacheKey);
    }
  }

  // Check in-flight requests (coalescing)
  if (inFlight.has(cacheKey)) {
    const response = await inFlight.get(cacheKey)!;
    return response.clone();
  }

  // Make the request
  const promise = fetch(input, init)
    .then((response) => {
      // We only cache successful responses (or perhaps all ok responses?)
      // Assuming we only cache 2xx responses
      if (response.ok) {
        // Enforce max cache size (FIFO eviction)
        if (cache.size >= MAX_CACHE_SIZE) {
          const firstKey = cache.keys().next().value;
          if (firstKey) cache.delete(firstKey);
        }

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

  const finalResponse = await promise;
  return finalResponse.clone();
}
