## 2026-07-18 — Request Coalescing
**Gap found:** No caching or deduplication on GET API requests; identical concurrent requests create redundant network traffic.
**Why it existed:** Application was built as a naive frontend fetching without global state or a dedicated query client like React Query.
**Built:** Intercepts `globalThis.fetch` to coalesce identical in-flight GET requests, mapping identical URLs and simple configurations to the same promise while ensuring proper cloning for multiple consumers to prevent stream consumption errors.
**Hot path affected:** Any data-fetching component triggered multiple times simultaneously (e.g., entity retrieval for the same case entity).
**Measurable improvement:** Reduces N simultaneous fetch requests for the same URL down to 1 network call, eliminating duplicate data transfer and decreasing latency.
**Next opportunity:** Edge caching implementation or stale-while-revalidate strategies.
