export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) {
        throw err;
      }
      await sleep(baseDelayMs * Math.pow(2, attempt - 1));
    }
  }
  throw new Error("Unreachable");
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  state: CircuitState = 'CLOSED';
  failureCount: number = 0;
  failureThreshold: number;
  cooldownMs: number;
  lastFailureTime: number | null = null;

  constructor(failureThreshold: number = 3, cooldownMs: number = 5000) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
  }

  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.state = 'HALF_OPEN';
      } else {
        if (fallback) {
          return await fallback();
        }
        throw new Error('Circuit is OPEN');
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
      // Since recordFailure might change state to OPEN, we cast to avoid TypeScript errors
      if ((this.state as CircuitState) === 'OPEN' && fallback) {
        return await fallback();
      }
      throw err;
    }
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }
}
