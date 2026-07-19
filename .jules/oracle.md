## 2024-03-22 — Next-Action Prediction Engine
**Product understood as:** Multi-agent case-linkage & evidence-triage system for cold cases.
**Prediction invented:** A Markov-chain style next-action predictor that learns from the user's action sequence in real time and predicts their next move.
**Data used:** Actions logged via the AuditTrail (`createAuditLog`).
**Impact:** The system anticipates the user's next action, which can be used to prefetch data, prime UI states, or queue background jobs.
**Next opportunity:** Prefetching specific case data or displaying intelligent UI recommendations based on the predicted next action.
