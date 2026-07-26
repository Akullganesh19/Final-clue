## 2025-07-26 — Request Coalescing
**Gap found:** Naive concurrent fetch requests to the same endpoint duplicating network load.
**Why it existed:** No centralized network request deduplicator.
**Built:** globalThis.fetch interceptor that deduplicates concurrent GET requests and clones responses.
**Hot path affected:** All API calls across the application.
**Measurable improvement:** Reduced duplicate network requests on page load or rapid interaction.
**Next opportunity:** Implement stale-while-revalidate caching layer.
