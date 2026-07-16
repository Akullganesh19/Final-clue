## 2025-03-01 — Request Coalescer
**Gap found:** No request deduplication. Multiple identical GET requests in-flight simultaneously consume unnecessary network bandwidth and redundant backend load.
**Why it existed:** The native `fetch` API doesn't coalesce requests inherently, and simple implementations didn't exist in the boilerplate.
**Built:** A `globalThis.fetch` interceptor `installRequestCoalescer()` that tracks in-flight GET requests by URL and returns cloned responses to avoid body stream exhaustion.
**Hot path affected:** Any data-fetching operation calling `fetch` with the same URL concurrently.
**Measurable improvement:** Network requests for duplicate simultaneous resource fetches are reduced to exactly 1.
**Next opportunity:** Stale-while-revalidate client cache for configuration and reference data.
