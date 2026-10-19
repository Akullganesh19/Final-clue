## 2026-06-19 — Predictive Case Linkage Recovery

**Failure point found:** `OracleEngine.computeLinkages` was executed as a background job without any resilience. Transient failures would be swallowed, and multiple requests could repeatedly fail if the service was continuously degraded.
**Why it existed:** It was a newly added feature representing an optimistic "fire and forget" predictive cache, assuming the background compute was always reliable.
**Recovery built:**
1. Added `withRetry` with exponential backoff for the background compute operation to handle transient issues.
2. Implemented a Circuit Breaker pattern that opens for 1 minute after 5 consecutive failures, preventing system strain and cascading failures when the simulated similarity engine is down.
**Blast radius before:** Silent background failures causing investigators to experience delayed linkage loading later. Continuous failing requests during an outage could waste resources and throttle backend systems.
**Watch for:** Other "fire and forget" background tasks lacking retries or circuit breakers, especially when interacting with the database or third-party APIs.
