## 2025-03-09 — Resilient Execution Wrapper

**Failure point found:** Unprotected asynchronous operations across the application lacking automatic retry capabilities or idempotency safeguards, specifically raw `fetch` requests which would fail silently or immediately upon transient network errors.
**Why it existed:** The application relies on raw `async`/`await` and `fetch` calls without wrapping them in safety layers, likely out of simplicity during initial development.
**Recovery built:** A generic `withRetry` execution wrapper using exponential backoff, coupled with a robust `IdempotencyGuard` to prevent unsafe double-execution for non-idempotent operations. This utility was directly applied to build `dedupedFetch` in `apiClient.ts`, providing built-in retry and fallback logic for all outgoing requests using a stable hash based on the HTTP method, URL, and body for robust idempotency tracking.
**Blast radius before:** Any transient network issue, API timeout, or temporary unavailability would immediately hard-fail user operations, causing poor UX and potential data inconsistencies if duplicate requests were sent.
**Watch for:** Other areas using unprotected bare `fetch` or background jobs without these wrappers.
