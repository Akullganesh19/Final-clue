## 2025-03-09 — Prevent concurrent read-modify-write drifts in AuditTrail
**Value type:** Audit Trail (cryptographic ledger)
**Drift risk found:** `createAuditLog` performed a read of the last state and an un-guarded append (read-modify-write race condition) based solely on whatever state it found when it ran, creating the risk of a forked chain/drift if two actions appended concurrently.
**Fix:** Implemented Optimistic Concurrency Control (OCC) by passing and validating an `expectedParentHash` before appending new records. If the actual hash diverges, it throws. Also updated `generateAuditHash` to use `JSON.stringify` to prevent delimiter injection attacks.
**Proven by:** Simulated an exact concurrent read-modify-write scenario using `node:test` that fails under OCC, proving that divergent chains are prevented.
**Other balances to check:** Any other list/array state managed independently that should logically form an append-only chain.
