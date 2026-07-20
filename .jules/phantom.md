## 2024-05-18 — Request Coalescing Added
**Gap found:** Unnecessary identical API requests when components fetch the same resource concurrently.
**Why it existed:** Native fetch provides no built-in deduplication for simultaneous identical calls.
**Built:** Global `fetch` interceptor in `src/utils/network.ts` that deduplicates concurrent identical GET requests by tracking inflight promises, saving network and server resources.
**Hot path affected:** Any place where multiple components try to load the same data concurrently on mount.
**Measurable improvement:** Reduces redundant network requests for identical resources to exactly 1.
**Next opportunity:** Implement a stale-while-revalidate caching pattern for reference data.
