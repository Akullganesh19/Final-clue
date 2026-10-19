## 2025-06-25 — Unprotected API Calls

**Failure point found:** API calls lack retry mechanisms, meaning a transient network error could crash the process.
**Why it existed:** Simple implementation without considering transient network failures.
**Recovery built:** Will wrap API calls with retry logic using exponential backoff.
**Blast radius before:** High - any transient failure would fail the whole request.
**Watch for:** Other external dependencies that need similar protection.
