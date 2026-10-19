export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 100,
  context: string = 'Operation'
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) {
        console.error(`[Resilience] ${context} failed after ${maxAttempts} attempts. Error:`, err instanceof Error ? err.message : String(err));
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[Resilience] ${context} failed (Attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms... Error:`, err instanceof Error ? err.message : String(err));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unreachable");
}

export class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private name: string = 'Service',
    private failureThreshold: number = 5,
    private cooldownMs: number = 10000
  ) {}

  async execute<T>(fn: () => Promise<T>, fallbackFn?: () => Promise<T> | T): Promise<T> {
    this.updateState();

    if (this.state === 'OPEN') {
      if (fallbackFn) {
        console.warn(`[Resilience] Circuit Breaker '${this.name}' is OPEN. Using fallback.`);
        return fallbackFn();
      }
      throw new Error(`Circuit Breaker '${this.name}' is OPEN`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      if (fallbackFn) {
        console.warn(`[Resilience] Circuit Breaker '${this.name}' encountered failure. Using fallback.`);
        return fallbackFn();
      }
      throw err;
    }
  }

  private updateState() {
    if (this.state === 'OPEN' && this.lastFailureTime) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.cooldownMs) {
        console.info(`[Resilience] Circuit Breaker '${this.name}' entering HALF_OPEN state.`);
        this.state = 'HALF_OPEN';
      }
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      console.info(`[Resilience] Circuit Breaker '${this.name}' recovered. Entering CLOSED state.`);
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }

  private onFailure(err: any) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      console.error(`[Resilience] Circuit Breaker '${this.name}' failed in HALF_OPEN state. Returning to OPEN state. Error:`, err instanceof Error ? err.message : String(err));
      this.state = 'OPEN';
    } else if (this.failureCount >= this.failureThreshold) {
      if (this.state !== 'OPEN') {
        console.error(`[Resilience] Circuit Breaker '${this.name}' tripped! Entering OPEN state after ${this.failureCount} failures. Error:`, err instanceof Error ? err.message : String(err));
        this.state = 'OPEN';
      }
    }
  }

  getState() {
    this.updateState();
    return this.state;
  }
}
