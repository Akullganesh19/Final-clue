## 2023-10-27 — [Markov Chain Action Predictor]
**Product understood as:** A multi-agent case-linkage and evidence-triage system for cold cases. It involves sequential workflows where an investigator might log in, view a case, and then predictably view its evidence or linkages.
**Prediction invented:** A Markov chain-based prediction engine that trains on historical Audit Trail sequences to anticipate the user's next likely action, and proactively prefetches its corresponding API endpoint data in the background.
**Data used:** The existing `AuditTrail` action logs, which inherently capture sequential behavioral flows of investigators.
**Impact:** Eliminates network wait times by caching the data before the user explicitly requests the next page (e.g. preemptively loading `/api/evidence` immediately when a user views a case). The app feels impossibly ahead because the data is already fetched.
**Next opportunity:** Expand prefetching logic from just route data to intelligent default parameter pre-filling based on user-specific search habits.
