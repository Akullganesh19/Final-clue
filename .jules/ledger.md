## 2026-06-21 — [Audit Chain Sequence Preservation]
**Value type:** Cryptographic hash sequence / Log count balance
**Drift risk found:** Read-modify-write race condition in `createAuditLog` allowed concurrent log appends to overwrite each other, causing log loss and branching/forking the cryptographic hash chain.
**Fix:** Introduced an `AuditLedger` class using a Promise-based mutex lock (`acquireLock`) to ensure concurrent log appends process atomically and sequentially. Since no call sites existed for `createAuditLog`, it was safely marked as deprecated and `AuditLedger` is now the single source of truth for safe log appends.
**Proven by:** Concurrency test in `src/utils/audit.test.ts` where 5 simulated simultaneous append operations result in exactly 5 perfectly linked logs in an unbroken hash chain.
**Other balances to check:** Any other mutable state arrays appended to asynchronously, like case linkages, or investigator pending lists, or external billing/usage limits if implemented in the future.
