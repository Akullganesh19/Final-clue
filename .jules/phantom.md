## 2024-07-04 — Request Coalescing and Intelligent Caching
**Gap found:** The frontend architecture lacked a dedicated data-fetching abstraction. Direct usages of `fetch` could lead to identical API calls being made multiple times concurrently during a single page load (e.g., multiple components requesting the same configuration, user profile, or shared data), leading to wasted throughput.
**Why it existed:** The app relied on raw browser APIs to keep things simple initially, treating the network as implicitly fast and cost-free.
**Built:** Implemented `dedupedFetch` in `src/utils/apiClient.ts` which provides transparent request coalescing (simultaneous identical requests wait for a single shared promise) and intelligent caching (FIFO eviction, `MAX_CACHE_SIZE` of 100, 5-minute TTL).
**Hot path affected:** Any GET request made through `dedupedFetch`, improving initial data load times and minimizing redundant server hits for relatively static data.
**Measurable improvement:** Concurrent fetches for the same resource now yield 1 network request instead of N requests. Frequently read data serves instantly from memory instead of requiring network round-trips for up to 5 minutes.
**Next opportunity:** Implement a robust background job queue or background sync to defer non-critical operations away from the main thread.
