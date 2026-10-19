## 2024-06-26 — [Request Coalescing and Stale-While-Revalidate]
**Gap found:** No frontend request caching or deduplication exist. Multiple components could easily request the same endpoint concurrently resulting in identical requests and wasted bandwidth, while subsequent navigation forces synchronous network waits on relatively static data.
**Why it existed:** The app had no client API utility file, likely relying on raw `fetch()` calls locally.
**Built:** A Request Coalescing layer (`dedupedFetch`) to merge simultaneous duplicate requests, and a Stale-While-Revalidate (`staleWhileRevalidateFetch`) cache.
**Hot path affected:** Any data fetching on the frontend, particularly data reused across components or re-accessed upon navigation.
**Measurable improvement:** Concurrent fetches of the same resource merge into exactly 1 network hit. Stale data yields 0ms latency for users on re-navigation while silently syncing.
**Next opportunity:** Background Sync queue for mutations to guarantee persistence even if the network is flaky, making the UI perfectly optimistic.
