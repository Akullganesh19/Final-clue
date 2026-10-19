## 2025-03-10 — Request Coalescing and Response Caching
**Gap found:** No API client layer existed to manage caching, meaning overlapping or sequential requests for the same read-only endpoints would blindly hit the network.
**Why it existed:** Application was initially structured with naive data-fetching directly instantiating fetch without middleware abstraction.
**Built:** An intelligent `dedupedFetch` module that automatically intercepts requests, coalescing concurrent calls to the same endpoint into a single network flight, and caching idempotent (GET/HEAD) responses in an LRU/FIFO memory cache with a TTL of 5 minutes.
**Hot path affected:** Any data retrieval across the application.
**Measurable improvement:** Redundant API calls reduced to 0; overlapping rapid navigations or identical component fetches render instantly from memory cache.
**Next opportunity:** Background Sync for persisting optimistic case-linkage updates locally without blocking the main UI thread.