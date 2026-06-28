export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    isIdempotent?: boolean;
    operationName?: string;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 100,
    isIdempotent = true,
    operationName = 'Unnamed Operation'
  } = options;

  // Do not retry non-idempotent operations without explicit protection
  if (!isIdempotent) {
    console.warn(`[Genesis:Resilience] ${operationName} is not idempotent. Proceeding without retries.`);
    return await fn();
  }

  let attempt = 1;

  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) {
        console.error(`[Genesis:Resilience] ${operationName} failed after ${maxAttempts} attempts.`, err);
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.log(`[Genesis:Resilience] ${operationName} failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }

  throw new Error('Unreachable code in withRetry');
}

export enum CircuitBreakerState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  serviceName?: string;
}

export class CircuitBreaker {
  private failureThreshold: number;
  private resetTimeoutMs: number;
  private serviceName: string;

  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private nextAttemptAt: number = 0;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || 10000;
    this.serviceName = options.serviceName || 'Unknown Service';
  }

  async execute<T>(fn: () => Promise<T>, fallbackFn?: () => Promise<T> | T): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() > this.nextAttemptAt) {
        this.transitionTo(CircuitBreakerState.HALF_OPEN);
      } else {
        if (fallbackFn) {
           console.log(`[Genesis:CircuitBreaker] ${this.serviceName} is OPEN. Returning fallback data.`);
           return await fallbackFn();
        }
        throw new Error(`[Genesis:CircuitBreaker] ${this.serviceName} is OPEN. Operation aborted.`);
      }
    }

    try {
      const result = await fn();
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.transitionTo(CircuitBreakerState.CLOSED);
      }
      return result;
    } catch (err) {
      this.recordFailure();
      if (fallbackFn) {
         console.log(`[Genesis:CircuitBreaker] ${this.serviceName} failed. Returning fallback data.`);
         return await fallbackFn();
      }
      throw err;
    }
  }

  private recordFailure() {
    this.failureCount++;
    console.warn(`[Genesis:CircuitBreaker] ${this.serviceName} recorded failure (${this.failureCount}/${this.failureThreshold})`);

    if (this.state === CircuitBreakerState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.transitionTo(CircuitBreakerState.OPEN);
    }
  }

  private transitionTo(newState: CircuitBreakerState) {
    console.log(`[Genesis:CircuitBreaker] ${this.serviceName} transitioned from ${CircuitBreakerState[this.state]} to ${CircuitBreakerState[newState]}`);
    this.state = newState;
    if (newState === CircuitBreakerState.OPEN) {
      this.nextAttemptAt = Date.now() + this.resetTimeoutMs;
    } else if (newState === CircuitBreakerState.CLOSED) {
      this.failureCount = 0;
    }
  }

  public getState(): CircuitBreakerState {
    return this.state;
  }
}
