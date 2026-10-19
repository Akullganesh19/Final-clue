## 2024-07-06 — Next-Action Prediction Engine
**Product understood as:** A multi-agent case-linkage & evidence-triage system for cold cases that tracks investigator actions in a continuous audit trail.
**Prediction invented:** A Next-Action Prediction engine (`ActionPredictor`) that uses a Markov chain to learn the investigator's sequences from the `AuditTrail` log history, identifying the most probable subsequent action and prefetching its associated data.
**Data used:** The chronological sequence of `action` strings stored inside the blockchain-style `AuditTrail` objects.
**Impact:** Investigator requests feel instantaneous because data is prefetched (with low priority and valid credentials) in the background before they even click to the next action, saving significant network round-trip delays.
**Next opportunity:** Expand the Markov chain to consider action `details` for more granular route prefetching, or build session warm-ups by learning the most common first actions immediately after a login.
