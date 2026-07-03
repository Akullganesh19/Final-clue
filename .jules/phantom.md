## 2025-03-09 — Request Coalescing and Intelligent Caching Layer
**Gap found:** Uncached API interactions resulting in duplicate network requests and potential component waterfalls on repeated renders or navigation. No mechanism exists to dedup inflight identical fetch requests or efficiently cache static reference responses in memory.
**Why it existed:** The native fetch API was used directly without any centralized client layer, meaning every call inherently went to the network.
**Built:** An intelligent request coalescing and in-memory caching wrapper (`dedupedFetch` in `src/utils/apiClient.ts`) that intercepts `fetch()`. It limits cache size to 100 entries with a 5-minute TTL, uses FIFO eviction, correctly clones `Response` objects to prevent "Body consumed" errors, coalesces concurrent duplicate calls into a single network hit, handles safe absolute URL transformation during SSR, and caches only GET requests.
**Hot path affected:** Any data fetching process, API calls, and asset retrievals.
**Measurable improvement:** Zero redundant network hits for concurrent duplicate fetches. Drastically reduced latency for previously requested assets within a 5-minute window.
**Next opportunity:** Background refresh / Stale-while-revalidate queue for data that mutates occasionally.
