## 2025-07-17 — Request Coalescing Added
**Gap found:** No native `fetch` request coalescing exists. Multiple React components independently fetching the same resource simultaneously would result in redundant network calls, wasting bandwidth and blocking concurrent operations.
**Why it existed:** Native `fetch` does not automatically deduplicate concurrent requests for the same URL.
**Built:** Implemented a global `fetch` interceptor `installRequestCoalescer` that coalesces identical, concurrent `GET` requests using a shared `Promise`. It correctly clones responses so multiple consumers can read the body streams without exhausting them, while skipping non-`GET` requests or those with an `AbortSignal`.
**Hot path affected:** Any simultaneous parallel `GET` request (e.g., initial page load where multiple components request the same profile/config, or API retry loops).
**Measurable improvement:** Redundant concurrent network calls are eliminated; reduces backend load, lowers cumulative network latency, and decreases memory thrash from multiple identical responses.
**Next opportunity:** Investigate stale-while-revalidate caching and background worker thread execution for offline sync.
