## 2025-03-08 — Request coalescing & caching infrastructure
**Gap found:** Multiple identical requests would result in duplicate network calls without request coalescing, and no caching mechanism existed for repeated API fetches.
**Why it existed:** The native `fetch` was used directly throughout the application without an abstraction layer to deduplicate or cache identical inflight and historical requests.
**Built:** An intelligent `dedupedFetch` client that intercepts `fetch` to provide request coalescing for inflight requests and a TTL-based cache layer with FIFO eviction to serve subsequent identical idempotent requests instantly.
**Hot path affected:** Any data-fetching operation calling API endpoints that relies on `fetch` (e.g. data for visualization, search, or cases).
**Measurable improvement:** Multiple identical requests initiated within a 5-minute window or concurrently will result in only a single underlying network request. This can be verified via the tests ensuring a single mock fetch is called.
**Next opportunity:** Implement a prioritized background sync queue to handle non-critical writes and optimistic updates offline.
