## 2024-05-24 — Predictive Case Linkage Prefetch
**Product understood as:** A multi-agent case-linkage & evidence-triage system for cold cases.
**Prediction invented:** Prefetching case linkages when a user hovers over a case in the main list.
**Data used:** User's cursor movement (hovering over a case item).
**Impact:** When users click to view a case's linkages, the data is already fetched and cached, making the transition feel instantaneous rather than waiting for an API roundtrip.
**Next opportunity:** Prefetching specific evidence documents or suspect profiles that are highly ranked in the case linkage.
