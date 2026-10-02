## 2025-05-15 — Ledger Trail Mutation Integrity
**Value type:** AuditTrail / Ledger State Version
**Drift risk found:** Read-modify-write without Optimistic Concurrency Control (OCC). If two concurrent actions append logs based on the same previous state, the second one silently overwrites the first one in the chain, causing a forked ledger and a lost record.
**Fix:** Introduced OCC by requiring `expectedParentHash` in `createAuditLog` and throwing if it does not match the actual previous hash.
**Proven by:** Concurrent test simulating append attempt with stale hash in `src/utils/audit.test.ts`.
**Other balances to check:** Any state updates pushed over the EventBus or Redux-like store not protected by state versioning.