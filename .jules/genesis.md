## 2025-02-24 — API Resilience Layer Added
**Failure point found:** External network calls in `apiClient.ts` could fail silently or throw unhandled exceptions without retry.
**Why it existed:** There was no centralized infrastructure to manage resilience against transient network outages.
**Recovery built:** Implemented `withRetry` (Exponential Backoff) and `CircuitBreaker` patterns and wrapped `fetch` in `resilientFetch`.
**Blast radius before:** Entire SPA could crash or hang indefinitely if dependent APIs were slow or occasionally 500.
**Watch for:** Ensure new integrations don't bypass `resilientFetch` and make direct un-protected `fetch` calls.
