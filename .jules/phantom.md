## 2026-06-21 — Intelligent API Client (Request Coalescing & SWR Caching)
**Gap found:** No caching or request deduplication existed for API calls. Identical API calls could be made multiple times within one page load, forcing users to wait unnecessarily and wasting throughput.
**Why it existed:** Historical naive implementation using standard fetch without any client-side wrapper.
**Built:** `dedupedFetch` in `src/utils/apiClient.ts` which implements Request Coalescing (multiple simultaneous requests for the same URL share the same promise) and Stale-While-Revalidate caching (returns cached data instantly while refreshing in the background).
**Hot path affected:** Any data-fetching operation from the React components (e.g., initial load in `App.tsx`).
**Measurable improvement:** Concurrent duplicate network requests are reduced to 1. Repeated requests within 5 minutes are instant (0 network latency).
**Next opportunity:** Background Sync for non-critical writes.
