## 2026-06-23 — Optimistic Concurrency Control for Audit Logs
**Value type:** Audit Trail (Cryptographic Hash Chain)
**Drift risk found:** Read-modify-write without atomicity. Two concurrent actions could read the same audit state array, calculate a new hash from the same parent hash, and blindly append. Whoever wrote last would overwrite the other's log, causing a silent branch/fork in the audit trail without error.
**Fix:** Optimistic Concurrency Control (OCC). `createAuditLog` now accepts an `expectedPreviousHash` parameter. It throws an error if the parent hash has changed between read and write.
**Proven by:** Simulated race condition test in `src/utils/audit.test.ts` where `createAuditLog` successfully fails with a "Concurrency mismatch" when a second write attempts to use an outdated state.
**Other balances to check:** Any state updates derived from the `Linkage` scores or case data that may be read and rewritten across simultaneous multi-agent processing.
