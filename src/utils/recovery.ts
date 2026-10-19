export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class IdempotencyGuard {
  private executedOps: Set<string> = new Set();

  check(operationId: string): boolean {
    if (this.executedOps.has(operationId)) {
      return false; // Already executed
    }
    this.executedOps.add(operationId);
    return true; // Safe to execute
  }

  clear() {
    this.executedOps.clear();
  }
}

export const globalIdempotencyGuard = new IdempotencyGuard();

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  operationId?: string; // Required for non-idempotent operations
  isIdempotent?: boolean; // Default false
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 100,
    operationId,
    isIdempotent = false
  } = options;

  // Protect non-idempotent operations
  if (!isIdempotent) {
    if (!operationId) {
      throw new Error("operationId is required for non-idempotent operations");
    }
    if (!globalIdempotencyGuard.check(operationId)) {
      throw new Error(`Operation ${operationId} already executed`);
    }
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error(`[Genesis] Operation failed after ${maxAttempts} attempts. Error:`, error);
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[Genesis] Operation failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms... Error:`, error);
      await sleep(delay);
    }
  }

  throw new Error("Unreachable");
}
