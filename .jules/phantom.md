## 2025-05-18 — Request Coalescing and SWR Caching Layer
**Gap found:** Multiple identical requests for the same API endpoint (like case details or taxonomy data) would trigger independent network requests, wasting bandwidth and slowing down rendering.
**Why it existed:** Standard `fetch` usage across isolated React components doesn't share in-flight request state.
**Built:** A `dedupedFetch` utility with request coalescing and an optional stale-while-revalidate (SWR) cache.
**Hot path affected:** Any component that fetches data, especially during initial page loads where multiple sibling components might request the same reference data.
**Measurable improvement:** Reduces duplicate network calls to 1 per resource. Reduces latency for cached resources to 0ms (served from memory) while updating in the background.
**Next opportunity:** Implement a robust offline queue for background sync of mutations (e.g., adding evidence offline).
