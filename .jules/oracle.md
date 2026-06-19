## 2023-10-24 — Predictive Case Linkage Pre-computation

**Product understood as:** An Evidence Triage & Case Linkage system for cold cases. It helps investigators track, audit, and analyze cold cases with multi-agent support.

**Prediction invented:** An engine that detects when a user views a case and immediately begins background pre-computing the similarity linkages, storing them in memory.

**Data used:** The "Case Viewed" event triggered in the UI.

**Impact:** Linkages computation is typically heavy and latency-prone. By computing them in the background as soon as a user starts reading a case, the data is instantly available when they inevitably click to view related cases.

**Next opportunity:** Predicting intelligent defaults for form fields (like MO Categories) based on the user's previously filed cases or aggregate patterns.
