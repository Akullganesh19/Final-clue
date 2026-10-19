## 2025-07-08 — Resilient Fetch Architecture
**Failure point found:** All external and internal network requests via `fetch` were unprotected, risking silent failures on transient network errors and duplicate execution on mutating operations (POST, PUT, DELETE) due to lack of idempotency protection.
**Why it existed:** The initial focus was likely on functionality rather than resilience, leaving network calls vulnerable to common distributed systems failure modes (timeouts, 500s, double-clicks).
**Recovery built:** Created `resilientFetch` in `src/utils/apiClient.ts` which implements automatic exponential backoff for retries and an in-memory idempotency guard using stable operation IDs derived from method, URL, and body hash.
**Blast radius before:** High risk of bad user experience on transient errors and dangerous data duplication on concurrent or retried mutating requests.
**Watch for:** Other areas where raw `fetch` might still be used without routing through this resilience layer, and long-running background jobs that lack retry/dead-letter logic.
