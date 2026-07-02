## 2026-07-02 — Resilient Network Fetching with Cache
**Failure point found:** All external HTTP calls and third-party API interactions lacked protections against transient network failures, causing cascading errors or silent UI blanks when APIs fail.
**Why it existed:** The app was built assuming an ideal network environment and always-up third-party services.
**Recovery built:** Implemented `CircuitBreaker` and `withRetry` logic in `resilience.ts`, integrated into a new `resilientFetch` and `dedupedFetch` caching utility in `apiClient.ts`.
**Blast radius before:** Any external API failure could bring down portions of the frontend and result in a broken experience for users on bad connections.
**Watch for:** Other areas like Database interactions that might also need connection resilience or retry logic.
