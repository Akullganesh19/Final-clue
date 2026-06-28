## 2024-03-24 — Request Coalescing & Caching Added
**Gap found:** The application previously had no caching or request deduplication mechanism for network calls. Components needing the same data would each independently fetch it, causing redundant network traffic and latency.
**Why it existed:** The application initially relied on naive `fetch` calls scattered throughout the codebase without a centralized API client layer.
**Built:** An intelligent `dedupedFetch` API client that provides request coalescing (sharing a single network request promise across concurrent identical requests) and a stale-while-revalidate caching layer (serving fast stale responses while updating silently in the background).
**Hot path affected:** Every standard GET API request made by the frontend, particularly during initial load or frequent navigation between similar views.
**Measurable improvement:** Redundant network requests for identical resources have been eliminated entirely. Perceived latency on subsequent fetches drops to near 0ms for cache hits.
**Next opportunity:** Expand the `resilientFetch` layer to include a CircuitBreaker pattern and background retry queue for non-critical mutating actions.
