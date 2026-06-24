## 2024-06-24 — Missing Resilience Layer for External Calls
**Failure point found:** External HTTP calls (like Gemini API) lacked retry and fallback protection, causing the system to fail completely on transient network or third-party outages.
**Why it existed:** The initial implementation focused on functionality over resilience, assuming external APIs and network paths are perfectly reliable.
**Recovery built:** Architected a general-purpose resilience layer in `src/utils/resilience.ts`, implementing Exponential Backoff (`withRetry`) and Circuit Breaker (`CircuitBreaker`) patterns.
**Blast radius before:** Any transient API failure (e.g. 500, timeout) would propagate immediately, leading to a full user-facing error and failed investigations.
**Watch for:** Ensure this resilience layer is correctly integrated into specific API clients and outbound request implementations.
