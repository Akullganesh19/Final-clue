## 2025-02-22 — Optimistic Concurrency Control for Audit Ledger
**Value type:** Audit Log Chain
**Drift risk found:** Read-modify-write on a balance/log with no locking or atomic operation (classic race condition) allows two concurrent requests reading the same initial state to overwrite/diverge paths instead of building a linear sequence.
**Fix:** Optimistic Concurrency Control (OCC) by passing and validating an expected parent hash (`expectedParentHash`).
**Proven by:** Simulated test `createAuditLog concurrency drift` asserting that the second concurrent operation using an outdated parent hash throws an error.
**Other balances to check:** Any other places appending logs or changing arrays based on last item's value, if they are added in the future.
