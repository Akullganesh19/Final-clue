## 2025-06-29 — Intelligent Case Prefetch Predictor
**Product understood as:** A multi-agent case-linkage & evidence-triage system for cold cases where users visualize and navigate networks of linked cases.
**Prediction invented:** A Next-Case Prefetch Predictor that anticipates the next 3 cases an investigator is most likely to click, based on linkage confidence and AI critic flags.
**Data used:** The existing `Linkage[]` graph array, specifically parsing `confidence` scores, filtering out AI critic `conflict` flags, and skipping user `rejected` links.
**Impact:** Eliminates wait times when navigating between confidently linked case profiles; gracefully prevents prefetching invalid/rejected cases.
**Next opportunity:** Behavior-based default filters for the linkage graph depending on whether the investigator usually prioritizes semantic, entity, temporal, or MO links.