## 2023-10-24 — Request Coalescing and Stale-While-Revalidate Caching
**Gap found:** The frontend API calls were completely missing a caching and deduplication layer, leading to the same endpoints potentially being called multiple times unnecessarily (e.g. by different components independently fetching the same data on mount).
**Why it existed:** The app was missing an intelligent API client utility layer.
**Built:** Implemented `dedupedFetch` in `src/utils/apiClient.ts`, an API client which includes:
1. **Request Coalescing:** Multiple simultaneous requests for the same URL merge into a single `fetch` promise.
2. **Stale-while-revalidate:** Memory cache returns cached data immediately while firing a background update if the TTL (5 mins) has passed.
**Hot path affected:** Any component doing data fetching using this new utility instead of vanilla `fetch` will instantly benefit from deduplication and caching, resulting in instant local transitions.
**Measurable improvement:** Multiple identical requests are reduced to 1 network call. UI renders from cache in ~0ms rather than waiting for network.
**Next opportunity:** Investigate queuing or background sync for write operations to achieve zero-latency optimistic UI.
