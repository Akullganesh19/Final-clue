## 2026-07-11 — Predictive Data Prefetching Engine
**Product understood as:** A cold case linkage and evidence triage system where investigators perform highly sequenced analysis actions.
**Prediction invented:** A sequence-learning Markov chain that analyzes the `AuditTrail` to learn user behavior patterns (e.g., Action A is always followed by Action B). When a user takes an action, it predicts their next move and prefetches the required data (like `/api/cases`) in the background.
**Data used:** The existing historical `action` logs appended to the global `AuditTrail`.
**Impact:** Users will experience near-instant load times for common next actions (e.g., viewing a case after viewing a linkage) because the data is already fetched and cached by the browser via low-priority background requests.
**Next opportunity:** Prefill evidence search filters based on the specific `moCategories` associated with the currently viewed case.
