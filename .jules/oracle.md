## 2025-03-09 — Next-Action Prediction Engine
**Product understood as:** Multi-agent case-linkage and evidence-triage system for cold cases.
**Prediction invented:** A background Next-Action Prediction engine (`ActionPredictor`) that tracks state transitions (Markov chain) from the AuditTrail and prefetches data for the most probable next action.
**Data used:** Sequential actions within the `AuditTrail` log.
**Impact:** Zero-latency perceived load times for predicted user flows (e.g., viewing case details or running similarity searches) by proactively loading data before the user explicitly requests it.
**Next opportunity:** Predicting intelligent defaults for form fields (e.g., default MO categories) based on user's past tagging behavior.
