## 2025-07-01 — Next-Action Prediction Engine
**Product understood as:** A multi-agent case-linkage & evidence-triage system for cold cases.
**Prediction invented:** A Markov chain-based prediction engine that analyzes historical audit logs to forecast the next likely user action, filtering predictions strictly by the user's active permissions.
**Data used:** The existing `AuditTrail` data containing historical sequences of user actions.
**Impact:** Allows the system to prefetch resources, pre-render components, or simulate computations for actions the user is statistically highly likely to take next, significantly reducing perceived latency and making the app feel predictive.
**Next opportunity:** Expand prediction to leverage Temporal or MO signals (from Linkage data) to automatically suggest related cases for linkage right after a user views a cold case.