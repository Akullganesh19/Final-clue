## 2025-03-09 — Next-Action Predictor
**Product understood as:** Multi-agent case-linkage & evidence-triage system for cold cases.
**Prediction invented:** A Markov-like frequency analysis predictor that anticipates the investigator's next action based on their historical audit trail sequences.
**Data used:** The sequential transitions of the `action` property within the append-only `AuditTrail` log.
**Impact:** Users see the system anticipating their next move (e.g. knowing they usually `add_evidence` after they `view_case`), paving the way to prefetch specific case data or auto-open forms before they are clicked.
**Next opportunity:** Expand prediction to specific entities (e.g., predicting *which* case they will view next based on temporal sequences) and prefetch the linked case data into the Apollo cache.
