## 2024-03-20 — Next-Action Predictor
**Product understood as:** Multi-agent case-linkage and evidence-triage system for cold cases. Investigators use this to explore cases and find connections.
**Prediction invented:** A Markov chain-based Next-Action Predictor that learns from the append-only AuditTrail to anticipate what action an investigator will take next.
**Data used:** The existing `AuditTrail` array in the application state, specifically the sequence of `action` strings logged over time.
**Impact:** Enables the system to intelligently prefetch data, pre-render UI components, or pre-compute agent recommendations before the user even clicks, making the application feel impossibly fast and ahead of them. The predictor is wired into `createAuditLog` to actively predict upon every new action.
**Next opportunity:** Wire this predictor into the React UI to actually prefetch specific case data when the predictor anticipates a 'VIEW_CASE' action.
