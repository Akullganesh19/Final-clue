// src/utils/apiClient.ts

// Fallback logic for globalThis.crypto and TextEncoder in Node.js
const getCrypto = () => {
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto && (globalThis as any).crypto.subtle) {
    return (globalThis as any).crypto;
  }
  return null;
};

const cryptoApi = getCrypto();
const CustomTextEncoder = typeof TextEncoder !== 'undefined' ? TextEncoder : (globalThis as any).TextEncoder;

export async function generateOperationId(method: string, url: string, body?: string | null): Promise<string> {
  // If we don't have crypto.subtle, fallback to a pseudo-random ID to avoid crashing,
  // though idempotency won't be perfectly stable across re-renders/retries in such an environment.
  if (!cryptoApi || !cryptoApi.subtle) {
      return `op-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  const encoder = new CustomTextEncoder();
  const data = JSON.stringify([method.toUpperCase(), url, body || '']);
  const buffer = encoder.encode(data);
  const hashBuffer = await cryptoApi.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex; // 64-character hex string
}

const IDEMPOTENCY_CACHE = new Set<string>();
const CACHE_TTL_MS = 60000; // 1 minute TTL for executed non-idempotent ops

export interface SafeFetchOptions extends RequestInit {
  maxRetries?: number;
  baseDelayMs?: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function safeFetch(url: string, options: SafeFetchOptions = {}): Promise<Response> {
  const { maxRetries = 3, baseDelayMs = 100, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const isIdempotent = ['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method);

  let operationId = '';

  if (!isIdempotent) {
    operationId = await generateOperationId(
      method,
      url,
      typeof fetchOptions.body === 'string' ? fetchOptions.body : null
    );

    if (IDEMPOTENCY_CACHE.has(operationId)) {
       throw new Error(`Idempotency conflict: Operation ${operationId} is already processing or recently completed.`);
    }
    IDEMPOTENCY_CACHE.add(operationId);

    // Automatically clear from cache after TTL to prevent memory leaks and allow legitimate retries later
    setTimeout(() => {
        IDEMPOTENCY_CACHE.delete(operationId);
    }, CACHE_TTL_MS);

    // Pass idempotency key to the server
    const headers = new Headers(fetchOptions.headers);
    if (!headers.has('Idempotency-Key')) {
       headers.set('Idempotency-Key', operationId);
    }
    fetchOptions.headers = headers;
  }

  // Never retry non-idempotent operations without server-side protection confirmation
  const effectiveRetries = isIdempotent ? maxRetries : 1;

  for (let attempt = 1; attempt <= effectiveRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok && response.status >= 500) {
          // Retry on 5xx errors for idempotent operations
          throw new Error(`Server error: ${response.status}`);
      }
      return response;
    } catch (err: any) {
      if (attempt === effectiveRetries) {
         if (!isIdempotent) {
             // Let the TTL clear the idempotency lock naturally or remove it on failure so the user can re-trigger if needed
             IDEMPOTENCY_CACHE.delete(operationId);
         }
         throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`Fetch attempt ${attempt} failed for ${url}, retrying in ${delay}ms...`, err.message);
      await sleep(delay);
    }
  }

  throw new Error('Unreachable code');
}

export function __clearIdempotencyCacheForTests() {
   IDEMPOTENCY_CACHE.clear();
}
