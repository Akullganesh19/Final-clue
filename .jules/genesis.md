## 2024-03-XX — [Self-Healing HTTP Calls]
**Failure point found:** External API and DB calls lacked automatic retries, fallback options, or protection against cascading failures (no Circuit Breakers).
**Why it existed:** The application directly called endpoints assuming perfect network reliability and constant availability.
**Recovery built:** Implemented `withRetry` (Exponential Backoff) and `CircuitBreaker` patterns in `src/utils/resilience.ts`, and wrapped network requests via `resilientFetch` in `src/utils/apiClient.ts`.
**Blast radius before:** Any transient network issue or dependency downtime would immediately cascade into an unhandled exception or 500 status for users.
**Watch for:** Other areas like background jobs or scheduled tasks that might still execute directly without relying on these new resilience layers.
