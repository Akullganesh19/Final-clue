## 2024-03-22 — Behavioral Linkage Prefetching

**Product understood as:** A case triage tool where investigators analyze cold cases and frequently navigate between highly-linked cases to establish patterns.

**Prediction invented:** Next-Action Behavioral Linkage Prefetching. When an investigator views a case, the app immediately prefetches high-confidence (>80%) linked cases in the background.

**Data used:** The existing `confidence` score of case linkages from the API response.

**Impact:** When an investigator clicks a high-confidence linked case, it renders instantly from the cache, eliminating perceived network latency. A visual indicator (🛸 Ready Instantly) shows when a case is prefetched.

**Next opportunity:** Prefetching specific evidence documents associated with high-confidence linkages, or intelligent default filters based on the investigator's recent search history.