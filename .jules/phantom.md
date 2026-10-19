## 2025-03-09 — Request Coalescer
**Gap found:** No request coalescing was in place for simultaneous API calls; the application naively executed redundant network operations for duplicate concurrent GET requests.
**Why it existed:** Native fetch provides no built-in deduplication mechanism, and multi-component React architectures often unknowingly re-request the same resources during simultaneous mounting or updates.
**Built:** A global `fetch` interceptor `requestCoalescer` that tracks in-flight GET requests via a `Map`, sharing the existing promise with subsequent identical requests and cloning the response body.
**Hot path affected:** Any component mounting or effect sequence that triggers simultaneous API fetches to the same endpoints (e.g., config, reference data, user profile).
**Measurable improvement:** Reduced redundant network egress for duplicate concurrent requests, directly lowering peak latency during thundering herd component mounts.
**Next opportunity:** Implement a stale-while-revalidate client-side cache for data that changes infrequently, allowing instant initial renders.
