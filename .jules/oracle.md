## 2026-07-07 — Next-Action Prediction Engine
**Product understood as:** A cold case evidence triage and case-linkage system heavily reliant on sequential investigator actions.
**Prediction invented:** A Markov chain-based next-action prediction engine that learns from investigator audit trails and asynchronously prefetches expected subsequent actions.
**Data used:** The existing `AuditTrail` log array, which acts as a structured sequence of historical user actions.
**Impact:** Eliminates perceived latency for repetitive workflows (e.g., viewing a case then checking evidence) by fetching predicted data before the user actually requests it, all while degrading gracefully on misses.
**Next opportunity:** Expand prefetching logic to proactively load specific case/evidence IDs by extracting entity relationships from the `details` field instead of just the generic `action` type.
