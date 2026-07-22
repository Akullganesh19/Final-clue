## 2025-02-27 — Request Coalescing Added
**Gap found:** The frontend had no request deduplication or coalescing. Multiple components could mount simultaneously and fetch the exact same data from the identical API endpoints independently.
**Why it existed:** The React application was built quickly without a global state manager (like React Query or Redux Toolkit) that typically provides this out of the box.
**Built:** A lightweight, global `fetch` interceptor that tracks in-flight GET requests. It generates a deterministic cache key based on URL, method, and headers. If an identical request is already in-flight, it returns a clone of the existing response promise instead of hitting the network again.
**Hot path affected:** Page load and concurrent component mounting where multiple widgets request the same configuration, case metadata, or user details.
**Measurable improvement:** Reduces redundant network overhead. Under high concurrency load (e.g., dashboard load), duplicate requests are reduced to 1 network hit.
**Next opportunity:** Implement a stale-while-revalidate caching layer for reference data that rarely changes.
