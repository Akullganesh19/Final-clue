## 2026-06-19 — [Prevent Concurrent Audit Log Overwrite]
**Value type:** Audit Trail (Record of truth)
**Drift risk found:** Read-modify-write without atomicity. A concurrent update reads the same `lastLog` and generates its action hash based on it, but the first writer commits. The second writer overwrites without noticing the conflict, corrupting the chain.
**Fix:** Optimistic Concurrency Control — add an `expectedPreviousHash` that ensures the audit trail hasn't drifted since the initial read.
**Proven by:** Concurrency test `src/utils/audit.test.ts` where the second operation simulating the concurrent read explicitly throws an `AuditChainConflictError`.
**Other balances to check:** Check for similar concurrent state overwrites where arrays of states or balances are reduced/merged in-memory before being written back.
