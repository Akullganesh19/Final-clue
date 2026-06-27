## 2025-06-27 — Predictive Case Linkage Prefetching
**Product understood as:** Multi-agent case-linkage & evidence-triage system for cold cases. Investigators review predicted links between cases.
**Prediction invented:** Behavioral Prefetching. Anticipates which cases an investigator will review next by automatically prefetching details for any cases involved in a high-confidence link (>=80%) that is currently in 'pending' status.
**Data used:** Linkage confidence scores and investigator review status.
**Impact:** When an investigator clicks into a highly probable pending link, the associated case details will already be cached in memory, dropping load time from network latency (e.g., 400ms+) to near-zero.
**Next opportunity:** Prefetching specific evidence documents or witness statements that overlap between linked cases as soon as the linkage is approved.
