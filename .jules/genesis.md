## 2024-06-29 — Architectural Resilience Layer added
**Failure point found:** Unprotected External Calls (HTTP requests with no retry on transient failure and no circuit breakers, which can hang forever or cascade failures).
**Why it existed:** Initially written as simple fetch calls without error handling or degradation logic.
**Recovery built:** Implemented `withRetry` (Exponential Backoff) and `CircuitBreaker` patterns, combined into `resilientFetch` and `dedupedFetch` for the API client to auto-retry transients and fail-fast when the backend is down.
**Blast radius before:** High risk of poor UX due to silent hangs, stuck UI on 500s, and cascading failures if backend takes too long.
**Watch for:** Other areas where we blindly await async operations without timeouts or fallbacks.
