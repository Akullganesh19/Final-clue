## 2026-07-03 — Ledger: Enforce OCC for Audit Trails
**Value type:** Audit Trail (hash-chained records)
**Drift risk found:** The `createAuditLog` function allowed appending new records to the audit trail by reading the last hash inside the function. If two operations executed concurrently, they could both read the same parent hash and produce new child logs referencing the same parent. In an eventually consistent system, one of these would overwrite the other, silently dropping a log (money/evidence trace disappearing).
**Fix:** Modified `createAuditLog` to enforce Optimistic Concurrency Control (OCC) by requiring an `expectedParentHash` as an argument. The function now validates that the actual latest hash matches this expected hash before generating the new log.
**Proven by:** An explicit test suite in `src/utils/audit.test.ts` verifying that `createAuditLog` throws a "Concurrency Drift Detected" error when the `expectedParentHash` does not match the actual hash.
**Other balances to check:** Any state updates directly writing arrays from concurrent async events where they aren't using atomic DB ops.
