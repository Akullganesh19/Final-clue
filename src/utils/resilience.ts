export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  isIdempotent?: boolean;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 100, isIdempotent = true } = options;

  if (!isIdempotent) {
    // Do not retry non-idempotent operations safely
    console.warn("[Genesis] Refusing to retry non-idempotent operation.");
    return await fn();
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[Genesis] Transient failure detected. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxAttempts})`);
      await sleep(delay);
    }
  }

  throw new Error("Unreachable");
}

export class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number = 3,
    private cooldownMs: number = 10000
  ) {}

  async execute<T>(fn: () => Promise<T>, fallbackFn?: () => Promise<T>): Promise<T> {
    this.updateState();

    if (this.state === 'OPEN') {
      console.warn("[Genesis] Circuit breaker is OPEN. Fast-failing or returning fallback.");
      if (fallbackFn) {
        return await fallbackFn();
      }
      throw new Error("Circuit breaker is OPEN");
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallbackFn) {
        console.warn("[Genesis] Execution failed, returning fallback.");
        return await fallbackFn();
      }
      throw error;
    }
  }

  private updateState() {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.cooldownMs) {
        console.info("[Genesis] Circuit breaker is HALF_OPEN. Testing recovery.");
        this.state = 'HALF_OPEN';
      }
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      console.info("[Genesis] Circuit breaker recovered and is CLOSED.");
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      if (this.state !== 'OPEN') {
        console.error(`[Genesis] Circuit breaker OPENED after ${this.failureCount} failures.`);
      }
      this.state = 'OPEN';
    }
  }
}
