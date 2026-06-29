/**
 * Architectural resilience layer
 * Implements exponential backoff retry and circuit breaker patterns.
 */

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

/**
 * Retries a function with exponential backoff on failure.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 100;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If we've reached the maximum number of attempts, don't sleep, just throw
      if (attempt === maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff: baseDelay * 2^(attempt - 1)
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[Resilience] Attempt ${attempt} failed. Retrying in ${delay}ms...`, error);
      await sleep(delay);
    }
  }

  throw lastError;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  cooldownPeriodMs?: number;
}

export enum CircuitState {
  CLOSED, // Normal operation
  OPEN,   // Failing, failing fast
  HALF_OPEN // Testing recovery
}

/**
 * Circuit Breaker pattern to fail fast when a dependency is down,
 * preventing cascading failures and allowing the dependency to recover.
 */
export class CircuitBreaker {
  private failureThreshold: number;
  private cooldownPeriodMs: number;

  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private nextAttemptAt: number = 0;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.cooldownPeriodMs = options.cooldownPeriodMs ?? 10000; // 10 seconds default
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() >= this.nextAttemptAt) {
        // Cooldown period has passed, test the circuit
        this.state = CircuitState.HALF_OPEN;
        console.log(`[CircuitBreaker] Circuit half-open, testing dependency...`);
      } else {
        // Still in cooldown period, fail fast
        throw new Error("Circuit breaker is OPEN. Fast-failing request.");
      }
    }

    try {
      const result = await fn();

      // On success, reset the circuit
      this.onSuccess();

      return result;
    } catch (error) {
      // On failure, record it
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state !== CircuitState.CLOSED) {
      console.log(`[CircuitBreaker] Circuit closed. Dependency recovered.`);
    }
    this.state = CircuitState.CLOSED;
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;

    if (this.state === CircuitState.HALF_OPEN) {
      // If we failed while half-open, immediately open again
      this.openCircuit();
    } else if (this.failures >= this.failureThreshold) {
      // If we reached the threshold while closed, open the circuit
      this.openCircuit();
    }
  }

  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptAt = Date.now() + this.cooldownPeriodMs;
    console.error(`[CircuitBreaker] Circuit tripped! Opening for ${this.cooldownPeriodMs}ms after ${this.failures} failures.`);
  }

  // Exposed for testing
  public getState(): CircuitState {
    return this.state;
  }
}
