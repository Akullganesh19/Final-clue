## 2026-06-20 — Intelligent API Client
**Gap found:** No standardized API layer existed. Any components making fetch requests in the future would likely make duplicate simultaneous calls or miss caching entirely, leading to wasted throughput.
**Why it existed:** The app is in early stages with minimal infrastructure; fetches were either not happening yet or done naively.
**Built:** `apiClient.ts` with Request Coalescing (deduplicating in-flight requests), Stale-While-Revalidate Caching (serving stale instantly while refreshing in the background), and Graceful Degradation (fallback to stale on error).
**Hot path affected:** Any future API call made to fetch case data, evidence, or linkages.
**Measurable improvement:** Reduces redundant network requests for identical resources to exactly one, drops perceived latency to zero for previously fetched resources, and handles brief offline scenarios.
**Next opportunity:** Implement a persistent Background Sync queue for mutating operations (optimistic updates and background retry).
