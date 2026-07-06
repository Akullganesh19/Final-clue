## 2024-05-24 — Unprotected API Calls

**Failure point found:** API requests using native `fetch` have no retry mechanism on transient failures or 5xx responses, and lack idempotency guards for non-idempotent operations like POST/PUT/DELETE.
**Why it existed:** Standard client implementation relying on the caller to manage network failures manually, which is often neglected.
**Recovery built:** Implemented a self-healing `safeFetch` API client (`src/utils/apiClient.ts`) that automatically retries idempotent operations with exponential backoff and protects non-idempotent operations from concurrent double-execution using an SHA-256 hash-based idempotency guard.
**Blast radius before:** Any network hiccup, server restart, or user double-click could result in broken UI state, failed data loads, or duplicated data entries, affecting any user experiencing transient network issues.
**Watch for:** Similar missing resilience patterns in background job queues or WebSocket reconnections.
