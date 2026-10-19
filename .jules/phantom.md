## 2025-03-09 — Invisible Request Coalescing
**Gap found:** API calls lacked any deduping/coalescing layers, meaning concurrent requests (e.g., across multiple components for reference data on mount) were needlessly duplicated to the backend.
**Why it existed:** The native `fetch` API doesn't coalesce requests across components out-of-the-box, resulting in a naive network implementation.
**Built:** An intelligent request-coalescing layer (`dedupedFetch`) that globally intercepts `fetch` and safely combines concurrent, identical `GET` requests using response cloning, while properly differentiating based on headers.
**Hot path affected:** Any data retrieval path that currently runs duplicate concurrent HTTP requests per view rendering or user interaction.
**Measurable improvement:** Reduction in redundant API queries resulting in lower network latency, reduced server load, and an immediate snappy feel for previously requested data.
**Next opportunity:** Investigate queuing or batching for repetitive background write/sync tasks to limit unnecessary backend mutation calls, and a secure memory caching strategy that respects `Cache-Control`.
