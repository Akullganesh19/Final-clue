/**
 * src/utils/resilience.ts
 * Self-healing architecture mechanisms
 */

/**
 * Auto-Retry with Exponential Backoff
 * Retries an asynchronous function upon failure.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[Resilience] Attempt ${attempt} failed, retrying in ${delay}ms...`, err);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unreachable");
}

/**
 * Circuit Breaker Pattern
 * Protects a failing service by halting requests to it for a cooldown period
 * after a specified number of consecutive failures.
 */
export class CircuitBreaker {
  private failureThreshold: number;
  private cooldownMs: number;
  private failureCount: number = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(failureThreshold: number = 5, cooldownMs: number = 10000) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (this.lastFailureTime && now - this.lastFailureTime >= this.cooldownMs) {
        this.state = 'HALF_OPEN';
        console.info('[Resilience] Circuit breaker HALF_OPEN, testing service...');
      } else {
        throw new Error('Circuit breaker is OPEN. Fast-failing request.');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`[Resilience] Circuit breaker tripped! State is OPEN.`);
    }
  }

  private reset() {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
    console.info('[Resilience] Circuit breaker reset to CLOSED.');
  }
}
