## 2023-10-27 — Linkage Analysis Prefetch Engine

**Product understood as:** A case-linkage and evidence-triage system for investigators to view cold cases and find cross-case connections.

**Prediction invented:** Implemented a predictive engine (`predictNextAction`) that preemptively fetches case linkage analysis in the background the moment an investigator clicks to view a specific case's details.

**Data used:** The highly predictable sequence of user navigation: viewing a specific case detail invariably leads to querying if that case has connections (linkages) to others.

**Impact:** Investigators experience zero-latency (instant) loading when they click "View Linkage Analysis", as the data is already pre-fetched and cached in memory from the moment they selected the case.

**Next opportunity:** Predicting likely filter combinations or preemptively warming the LLM cache with case summaries for cases adjacent to the currently viewed case.
