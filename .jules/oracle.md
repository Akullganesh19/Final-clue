## 2026-07-12 — Markov-Based Action Predictor

**Product understood as:** Multi-agent case-linkage & evidence-triage system for cold cases.
**Prediction invented:** A Markov-based prediction engine that analyzes historical sequence transitions in `AuditTrail` actions to predict and prefetch the user's most likely next action/endpoint.
**Data used:** Sequential transitions from `AuditTrail` action history.
**Impact:** Dramatically reduces perceived latency by speculatively prefetching data (like `/api/linkages` after `VIEW_CASE`) before the user clicks, degrading gracefully on cache-miss or incorrect prediction.
**Next opportunity:** Prefetching specific entity sub-graphs (e.g. related vehicles/weapons) dynamically derived from the currently viewed case entities instead of just endpoints.
