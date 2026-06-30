## 2025-03-09 — Next-Action Prediction Engine
**Product understood as:** A multi-agent case-linkage & evidence-triage system for cold cases that tracks every investigator action in an immutable Audit Trail.
**Prediction invented:** A Next-Action Prediction engine (`predictNextAction`) that uses a Markov chain approach to predict the exact next action an investigator will take based on their current action.
**Data used:** The existing `AuditTrail[]` history, segmented by `author` to ensure we only learn from a specific user's patterns.
**Impact:** Allows the UI to preemptively prefetch data, pre-render forms, or suggest intelligent default next steps, making the application feel impossibly ahead of the investigator. Because it filters by user, it inherently respects authorization boundaries.
**Next opportunity:** Expand this prediction to consider the *context* of the action (e.g., if the user viewed a *linked* case vs a *cold* case) to make the prediction even more precise.