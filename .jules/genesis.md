## 2024-06-22 — Auto-Retry with Exponential Backoff
**Failure point found:** External fragile dependencies could fail without recovering
**Why it existed:** There was no fallback or retry logic protecting calls to external services.
**Recovery built:** `withRetry` wrapper using auto-retry and exponential backoff
**Blast radius before:** Service disruption on any intermittent failure.
**Watch for:** Other areas calling external APIs directly without wrapping them in resilience patterns like retry, fallback or circuit breaker.
