## 2024-05-24 — Request Coalescing Interceptor
**Gap found:** Multiple identical API calls were made redundantly within one page load without request coalescing.
**Why it existed:** The native `fetch` API doesn't deduplicate simultaneous requests out of the box, and no abstraction layer managed in-flight promises.
**Built:** A lightweight, invisible request coalescing interceptor for `globalThis.fetch` that groups identical concurrent GET requests and resolves them with `response.clone()`.
**Hot path affected:** Any concurrent components or functions fetching the same resource at startup or interaction.
**Measurable improvement:** Reduces duplicate network requests directly, saving bandwidth and latency for end-users, lowering server load.
**Next opportunity:** Stale-while-revalidate caching layer wrapping this deduplication.
