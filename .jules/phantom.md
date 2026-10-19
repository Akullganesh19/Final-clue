## 2025-03-05 — Request Coalescing and Edge Cache
**Gap found:** No network request coalescing or caching, leading to identical requests firing concurrently or redundantly hitting the network.
**Why it existed:** The native `fetch` API doesn't provide these features, and the app was fetching URLs directly without an abstraction layer.
**Built:** A `dedupedFetch` client that deduplicates identical concurrent requests into a single inflight promise using `Response.clone()`. It also includes an LRU-like memory cache (up to 100 entries, 5-min TTL) that correctly handles headers in cache keys and only caches idempotent requests (GET, HEAD).
**Hot path affected:** All data fetching scenarios in the client, particularly concurrent component mounting and repeated user navigation.
**Measurable improvement:** Redundant API calls are coalesced into 1. Cached responses resolve instantly for 5 minutes instead of adding network latency.
**Next opportunity:** Implement a stale-while-revalidate pattern or an offline-first Service Worker cache.
