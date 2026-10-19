## 2025-03-01 — Architectural Resilience Layer
**Failure point found:** External API calls and network operations globally across the application lacked transient failure handling (e.g. exponential backoff) and stateful protection against cascading outages.
**Why it existed:** Quick initial prototyping favored "happy path" connectivity without considering network unreliability or rate limiting of backend AI/Services.
**Recovery built:** Architected a new foundational layer in `src/utils/resilience.ts` offering a parameterizable `withRetry` (Exponential Backoff with idempotency guards) and a `CircuitBreaker` pattern to fail fast and degrade gracefully during extended outages. Applied it natively in `src/utils/apiClient.ts` to wrap all `fetch` calls.
**Blast radius before:** Any temporary 5xx, network drop, or rate limit would instantly fail operations, dropping the user state or throwing raw errors straight to the client without mitigation.
**Watch for:** Ensure new `apiClient` or `fetch` adapters explicitly utilize the `resilience` utilities instead of bare `fetch` or `axios` calls.
