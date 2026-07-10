## 2025-03-05 — Request Coalescing and Edge Cache Interceptor
**Gap found:** No request coalescing or caching on identical API calls, leading to redundant network requests if multiple components request the same data simultaneously.
**Why it existed:** Native `fetch` lacks built-in caching and request coalescing, typically relying on the consumer to manage request state and deduplication.
**Built:** A lightweight, globally-intercepting wrapper around `fetch` (`dedupedFetch`) that caches and coalesces idempotent requests (GET, HEAD) using an in-memory Map with a FIFO size limit (100 entries) and a TTL of 5 minutes.
**Hot path affected:** Any data-fetching operation across the entire application utilizing the global `fetch` API.
**Measurable improvement:** Reduces duplicate network calls by intercepting them early. This improves load times and saves bandwidth on concurrent identical fetches. Can be measured by inspecting network tab for reduced duplicated requests and checking cache hits/misses conceptually or via instrumentation.
**Next opportunity:** Implement a resilient background retry queue for non-idempotent operations like POST/PUT requests to enable background sync and offline-capability.
