interface OperationRecord {
  timestamp: number;
}
const executedOperations = new Map<string, OperationRecord>();
const IDEMPOTENCY_TTL_MS = 10000; // 10 seconds TTL to prevent double clicks but allow legitimate repeated requests later

export async function generateOperationId(method: string, url: string, body?: any): Promise<string> {
  const payload = typeof body === 'string' ? body : JSON.stringify(body || null);
  const combined = JSON.stringify([method, url, payload]);

  const encoder = new ((globalThis as any).TextEncoder)();
  const data = encoder.encode(combined);
  const hashBuffer = await (globalThis as any).crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');
}

export async function resilientFetch(url: string, options: RequestInit = {}, maxAttempts = 3): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  const now = Date.now();
  // Cleanup expired entries
  for (const [key, record] of executedOperations.entries()) {
    if (now - record.timestamp > IDEMPOTENCY_TTL_MS) {
      executedOperations.delete(key);
    }
  }

  let operationId: string | null = null;
  if (isMutating) {
    operationId = await generateOperationId(method, url, options.body);
    if (executedOperations.has(operationId)) {
      throw new Error(`Idempotency guard: Operation ${operationId} already executed`);
    }
  }

  // Support server-side idempotency
  const headers = new Headers(options.headers);
  if (isMutating && operationId) {
    headers.set('Idempotency-Key', operationId);
  }
  const fetchOptions = { ...options, headers };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // If server error, and we have retries left, throw to trigger catch block
      if (!response.ok && response.status >= 500 && attempt < maxAttempts) {
        throw new Error(`Server error: ${response.status}`);
      }

      // On success, mark as executed to prevent duplicate execution from other calls
      if (isMutating && operationId && response.ok) {
        executedOperations.set(operationId, { timestamp: Date.now() });
      }

      return response;
    } catch (err) {
      if (attempt === maxAttempts) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
    }
  }

  throw new Error('Unreachable');
}

export function clearExecutedOperations() {
  executedOperations.clear();
}
