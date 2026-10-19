## 2025-03-09 — Fetch Coalescing and SWR Caching
**Gap found:** Native fetch was used directly throughout the app without request coalescing or caching, leading to redundant network calls for identical concurrent requests or frequently accessed data.
**Why it existed:** The app had a basic implementation and lacked a unified HTTP transport layer to manage performance optimizations.
**Built:** A global `fetch` wrapper (`src/utils/fetch.ts`) providing request coalescing (deduplication of in-flight requests), Stale-While-Revalidate (SWR) caching with TTL, and proper isolation of `AbortSignal` for concurrent consumers.
**Hot path affected:** Any component or agent making API requests or fetching data, particularly parallel entity/mo linkage extractions.
**Measurable improvement:** Concurrent fetches to the same URL resolve with a single network call. Cached data resolves instantly while silently revalidating, reducing user wait time to zero for warm caches.
**Next opportunity:** Implement a prioritized background sync queue for `createAuditLog` to prevent audit trail serialization from blocking the main thread during high-volume operations.
