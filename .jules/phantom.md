## 2023-07-13 — Network Request Coalescing and SWR Cache Added
**Gap found:** The frontend had no request deduplication or intelligent caching. Identical queries across multiple components caused redundant network calls (waste), and users had to wait for fresh network responses even for frequently accessed data that changes slowly.
**Why it existed:** The app was built for functionality first, leaving standard unoptimized native `fetch` calls scattered across components.
**Built:** An invisible `setupNetworkOptimizer` utility that intercepts `globalThis.fetch`. It implements Request Coalescing (simultaneous requests to the same URL share a single underlying fetch) and a Stale-While-Revalidate (SWR) Cache (hot data is served instantly from memory, while background requests silently refresh the cache).
**Hot path affected:** Every standard `GET` request across the React application, especially noticeable on page load or when navigating between related cases.
**Measurable improvement:** Reduces duplicate concurrent API calls to 1. Cuts perceived latency for recurring fetches to 0ms (serving from cache) while still keeping data up-to-date in the background.
**Next opportunity:** Background Sync for optimistic UI updates on user actions like `link case` or `add note`, ensuring interactions are never blocked by slow database writes.
