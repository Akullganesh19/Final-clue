## 2024-03-05 — External API Call Fragility
**Failure point found:** Unprotected third-party API calls (e.g., Gemini API) lacking retry logic, circuit breakers, and graceful degradation. Database and external AI systems could fail, causing unhandled 500 errors.
**Why it existed:** MVP implementation assumed happy-path for AI analysis.
**Recovery built:** Implemented `withRetry` (Exponential Backoff), `CircuitBreaker`, and Graceful Degradation fallback logic.
**Blast radius before:** 100% of users experiencing transient network issues or AI downtime would get a broken experience (silent/loud failures).
**Watch for:** Other integrations or webhook listeners added later that don't pass through this resilience layer.
