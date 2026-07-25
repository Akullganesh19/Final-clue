## 2023-10-27 — Request Coalescing
**Gap found:** Un-deduplicated `fetch` requests across multiple components.
**Why it existed:** Default browser `fetch` behavior doesn't multiplex identical simultaneous requests.
**Built:** A `globalThis.fetch` interceptor that multiplexes concurrent requests for the same exact cache key (URL + method + headers) into a single actual network request.
**Hot path affected:** Any data fetching happening on page load or bulk updates where multiple UI elements might request the same resource simultaneously.
**Measurable improvement:** Reduces redundant network requests to 1 for N concurrent requests. Tests verify exactly 1 HTTP request made for 3 concurrent `fetch()` calls.
**Next opportunity:** Implement stale-while-revalidate for read-heavy API endpoints.
