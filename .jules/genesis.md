## 2024-06-26 — Self-Healing HTTP Client Layer
**Failure point found:** External HTTP calls (like to Gemini or external APIs) failing transiently without retry, and cascading failures lacking a circuit breaker.
**Why it existed:** The application used basic `fetch` with raw try-catch blocks that simply failed the request or cascaded failures down.
**Recovery built:** Created `withRetry` (Exponential Backoff, Idempotency Guard) and `CircuitBreaker` patterns, packaged in `resilientFetch` as a drop-in replacement.
**Blast radius before:** Any transient API failure (500s, timeouts) would immediately bubble up to the user, breaking the current operation. Sustained outages would hammer the API continually.
**Watch for:** Ensure we use `resilientFetch` instead of raw `fetch` for all critical external network requests moving forward. Watch for operations using `POST` that are actually idempotent but aren't being retried.
