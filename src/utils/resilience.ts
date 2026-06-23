export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 100,
  operationName: string = 'Operation'
): Promise<T> {
  let attempt = 1;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt >= maxAttempts) {
        console.error(`[GENESIS] ${operationName} failed after ${maxAttempts} attempts. Error: ${err.message}`);
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[GENESIS] ${operationName} failed (Attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
}

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number = 5,
    private resetTimeoutMs: number = 60000 // 1 minute
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    operationName: string = 'Operation'
  ): Promise<T> {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetTimeoutMs) {
        // Time to try again
        this.state = 'HALF_OPEN';
        console.log(`[GENESIS] Circuit for ${operationName} entering HALF_OPEN state.`);
      } else {
        // Still open, use fallback
        console.warn(`[GENESIS] Circuit for ${operationName} is OPEN. Using fallback.`);
        return fallback();
      }
    }

    try {
      const result = await operation();
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        console.log(`[GENESIS] Circuit for ${operationName} recovered and is now CLOSED.`);
      }
      return result;
    } catch (error: any) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
        this.state = 'OPEN';
        console.error(`[GENESIS] Circuit for ${operationName} tripped! State is OPEN.`);
      }

      return fallback();
    }
  }
}
