## 2024-07-20 — Markov-Chain Action Predictor
**Product understood as:** Multi-agent case-linkage & evidence-triage system for cold cases.
**Prediction invented:** A Markov-chain NextActionPredictor that predicts the most likely next user action based on historical sequential patterns.
**Data used:** Append-only AuditTrail event logging strings (actions).
**Impact:** Provides an invisible layer anticipating investigator moves, pre-computing or suggesting next actions without user prompting.
**Next opportunity:** Prefetching specific evidence docs or linking profiles in the background when the predicted next action is 'VIEW_EVIDENCE'.
