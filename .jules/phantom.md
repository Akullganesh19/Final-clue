## 2025-02-28 — Request Coalescing Added
**Gap found:** No request coalescing for identical concurrent GET requests, allowing thundering herds.
**Why it existed:** Application is early and components fetch data naively on mount.
**Built:** A `globalThis.fetch` interceptor that coalesces concurrent GET requests using a deterministic URL and Header cache key.
**Hot path affected:** Data fetching on page load or rapid interaction.
**Measurable improvement:** Multiple identical requests are batched into a single network call.
**Next opportunity:** Implement a Stale-While-Revalidate caching layer.
