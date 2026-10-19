## 2025-03-05 — Next-Action Prediction Engine Added
**Product understood as:** A multi-agent case-linkage & evidence-triage system for cold cases.
**Prediction invented:** A Next-Action Prediction engine (`ActionPredictor`) that uses a Markov chain to learn the transitions between actions from the `AuditTrail` history and aggressively prefetches the most probable next API endpoint.
**Data used:** The existing `AuditTrail` log sequence which naturally captures exact user workflows.
**Impact:** Users will experience near-instant load times for typical sequences (e.g. searching, viewing a case, then viewing evidence or suggestions) because data is being prefetched in the background asynchronously when the previous action is logged.
**Next opportunity:** Predicting intelligent defaults for form fields (like entity names or link statuses) based on frequently entered values from the same user session.