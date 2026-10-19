## 2026-07-11 — Request coalescing and caching
**Gap found:** Native, un-deduplicated fetching on all network requests.
**Why it existed:** Quick implementation using raw `fetch` for simplicity, causing identical API calls to hit the network multiple times and waste throughput.
**Built:** A `dedupedFetch` client caching layer that traps identical idempotent requests (GET/HEAD) and coalesces them to a single network call. Hot data is kept in an LRU memory cache with a TTL for 5 minutes.
**Hot path affected:** Every single data retrieval call using the global `fetch`.
**Measurable improvement:** Reduces network bandwidth significantly on redundant renders, avoiding backend thundering herds. Tests assert caching works and deduplicates identical calls.
**Next opportunity:** Background Sync queue for mutating data (POST/PUT/DELETE) to improve offline reliability.
