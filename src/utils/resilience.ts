/**
 * Exponential Backoff configuration
 */
export interface RetryConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  factor: 2,
};

/**
 * Executes a function with exponential backoff on failure.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let currentDelay = finalConfig.initialDelayMs;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === finalConfig.maxAttempts) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));

      // Increase delay for next attempt, capped at maxDelayMs
      currentDelay = Math.min(
        currentDelay * finalConfig.factor,
        finalConfig.maxDelayMs
      );
    }
  }

  // Should never be reached due to the throw in the catch block
  throw new Error("Unexpected end of withRetry");
}

/**
 * Circuit Breaker pattern states
 */
export enum CircuitState {
  CLOSED,   // Normal operation, allow calls
  OPEN,     // Failing, block calls
  HALF_OPEN // Testing if recovery is possible, allow limited calls
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;      // How many failures before opening
  resetTimeoutMs?: number;        // How long to wait before trying again
}

const defaultCbConfig: Required<CircuitBreakerConfig> = {
  failureThreshold: 5,
  resetTimeoutMs: 10000,
};

/**
 * Implements a Circuit Breaker to prevent cascading failures.
 */
export class CircuitBreaker {
  private config: Required<CircuitBreakerConfig>;
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private nextAttemptMs: number = 0;
  private name: string;

  constructor(name: string, config: CircuitBreakerConfig = {}) {
    this.name = name;
    this.config = { ...defaultCbConfig, ...config };
  }

  public async execute<T>(fn: () => Promise<T>, fallbackFn?: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() > this.nextAttemptMs) {
        // Time to test if the service is back up
        this.state = CircuitState.HALF_OPEN;
        console.warn(`Circuit ${this.name} HALF-OPEN: Testing recovery`);
      } else {
        // Still open, fail fast or return fallback
        if (fallbackFn) {
          return await fallbackFn();
        }
        throw new Error(`CircuitBreaker '${this.name}' is OPEN`);
      }
    }

    try {
      const result = await fn();

      // On success, close the circuit if it was half-open
      if (this.state === CircuitState.HALF_OPEN) {
        this.reset();
        console.info(`Circuit ${this.name} CLOSED: Service recovered`);
      }

      return result;
    } catch (error) {
      this.recordFailure();

      if (fallbackFn) {
        return await fallbackFn();
      }

      throw error;
    }
  }

  private recordFailure() {
    this.failureCount++;

    if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptMs = Date.now() + this.config.resetTimeoutMs;
      console.error(`Circuit ${this.name} OPENED: Threshold reached. Next attempt at ${new Date(this.nextAttemptMs).toISOString()}`);
    }
  }

  public reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.nextAttemptMs = 0;
  }

  public getState(): CircuitState {
    // If we're open but the timeout has passed, we conceptually transition to half-open
    if (this.state === CircuitState.OPEN && Date.now() > this.nextAttemptMs) {
       return CircuitState.HALF_OPEN;
    }
    return this.state;
  }
}
