// Capture native fetch to prevent infinite recursion
const nativeFetch = globalThis.fetch;

const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  response: Response;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();

// Active operations for idempotency on mutating requests
const activeOperations = new Set<string>();

async function generateOperationId(request: Request | string, init?: RequestInit): Promise<string> {
  const method = (init?.method || (request instanceof Request ? request.method : 'GET')).toUpperCase();
  const url = typeof request === 'string' ? request : request.url;

  let bodyStr = '';
  if (init?.body) {
    if (typeof init.body === 'string') {
      bodyStr = init.body;
    } else {
      // Very basic body serialization for hashing
      try { bodyStr = JSON.stringify(init.body); } catch (e) { bodyStr = Object.prototype.toString.call(init.body); }
    }
  } else if (request instanceof Request && request.body) {
    // Cannot easily read stream body here without consuming it.
    // For idempotency, we rely on method+url for streaming requests or require explicit body passing.
  }

  const combined = JSON.stringify([method, url, bodyStr]);

  const encoder = new (globalThis as any).TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await (globalThis as any).crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    const timer = setTimeout(resolve, ms);
    if (typeof (timer as any).unref === 'function') {
      (timer as any).unref();
    }
  });
}

export async function withRetryAndIdempotency(
  request: RequestInfo | URL,
  init?: RequestInit,
  maxAttempts = 3
): Promise<Response> {
  const method = (init?.method || (request instanceof Request ? request.method : 'GET')).toUpperCase();
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  let operationId = '';
  if (isMutating) {
    operationId = await generateOperationId(request as string | Request, init);

    if (activeOperations.has(operationId)) {
      throw new Error(`Duplicate request detected for operation: ${operationId}`);
    }

    activeOperations.add(operationId);

    const timer = setTimeout(() => {
      activeOperations.delete(operationId);
    }, 10000); // 10s TTL

    if (typeof (timer as any).unref === 'function') {
      (timer as any).unref();
    }
  }

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await nativeFetch(request, init);

        // Retry on 5xx errors or network failures
        if (!response.ok && response.status >= 500 && response.status < 600) {
          throw new Error(`Server Error: ${response.status}`);
        }

        return response;
      } catch (err) {
        if (attempt === maxAttempts) {
          throw err;
        }
        await delay(100 * Math.pow(2, attempt - 1)); // 100ms, 200ms
      }
    }
    throw new Error('Unreachable');
  } finally {
    // For idempotency, we don't strictly remove it on success to prevent immediate double clicks.
    // The 10s TTL will clean it up.
  }
}

function cleanCache() {
  const now = Date.now();
  // Remove expired items
  responseCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      responseCache.delete(key);
    }
  });

  // Enforce max size (FIFO - Maps iterate in insertion order)
  if (responseCache.size > MAX_CACHE_SIZE) {
    const keysToDelete = responseCache.size - MAX_CACHE_SIZE;
    let deletedCount = 0;
    for (const key of responseCache.keys()) { // This is fine since it's Map.keys(), but we'll use an array to avoid TS2802
      if (deletedCount >= keysToDelete) break;
      responseCache.delete(key);
      deletedCount++;
    }
  }
}

export async function dedupedFetch(request: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || (request instanceof Request ? request.method : 'GET')).toUpperCase();
  const isIdempotent = ['GET', 'HEAD'].includes(method);

  if (!isIdempotent) {
    // Bypass cache, use retry and idempotency guard
    return withRetryAndIdempotency(request, init);
  }

  const urlStr = typeof request === 'string' ? request : request instanceof URL ? request.toString() : request.url;
  const cacheKey = `${method}:${urlStr}`;

  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.response.clone();
  }

  const response = await withRetryAndIdempotency(request, init);

  // Clone response before caching because body can only be consumed once
  if (response.ok) {
    cleanCache();
    responseCache.set(cacheKey, {
      response: response.clone(),
      timestamp: Date.now()
    });
  }

  return response;
}

export function setupGlobalFetchInterceptor() {
  globalThis.fetch = dedupedFetch as typeof globalThis.fetch;
}
