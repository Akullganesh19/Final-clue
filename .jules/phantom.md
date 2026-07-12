## 2024-07-12 — Request Coalescing and Caching
**Gap found:** No API request coalescing or intelligent caching mechanism in place, resulting in duplicate fetches and poor performance on frequently accessed data.
**Why it existed:** The initial focus was likely on rapid feature development without optimizing for network efficiency.
**Built:** Implemented `setupGlobalFetchInterceptor` with request coalescing, intelligent caching with TTL, and stale-while-revalidate (SWR) logic.
**Hot path affected:** Every global `fetch` call throughout the application.
**Measurable improvement:** Significantly reduced number of duplicate network requests and lowered latency for subsequent fetches by caching responses.
**Next opportunity:** Investigate optimistic UI updates and background synchronization for write operations.
