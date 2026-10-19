## 2025-03-05 — Fetch Idempotency and Retry Shield
**Failure point found:** Unprotected external calls using raw `fetch`. Missing retry on transient network/5xx errors, and missing idempotency checks for state-mutating (POST) requests.
**Why it existed:** The native `globalThis.fetch` provided no built-in wrapper for resiliency or deduplication, meaning rapid button clicks or minor network blips would propagate directly to users as bad experiences or duplicate records.
**Recovery built:** Created `src/utils/apiClient.ts` with `withRetryAndIdempotency` (3x exponential backoff and a 10s TTL idempotency guard using SHA-256 stable hashing on the request method, URL, and body) and `dedupedFetch` for safe caching of idempotent requests.
**Blast radius before:** Any temporary API downtime caused hard failures for users. Duplicate submissions created inconsistent backend states.
**Watch for:** Other areas where `fetch` might still be used if `setupGlobalFetchInterceptor()` is not correctly initialized early in the app lifecycle.
