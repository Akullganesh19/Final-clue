## 2024-03-24 — Behavioral Action Prediction

**Product understood as:** Multi-agent case-linkage & evidence-triage system for cold cases.
**Prediction invented:** A Markov chain action predictor that learns sequence of actions performed by investigators to prefetch resources for the next likely action.
**Data used:** The chronological sequence of actions passed into `createAuditLog` from `src/utils/audit.ts`.
**Impact:** Eliminates perceived latency by predicting the user's next action and beginning prefetch operations asynchronously.
**Next opportunity:** Route-based prefetching or intelligent search defaults based on previous search inputs.
