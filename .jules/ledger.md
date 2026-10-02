## 2026-07-11 — Idempotency added to Audit Log
**Value type:** Audit Trail append operations
**Drift risk found:** The `createAuditLog` function lacked idempotency keys, allowing a retried or duplicated operation (such as a network retry for logging) to double-append to the audit log.
**Fix:** Added an `idempotencyKey` parameter to safely deduplicate appending if the same operation is logged multiple times.
**Proven by:** Simulated an exact duplicate log insertion in `src/utils/audit.test.ts` showing duplicate attempts return the same state instead of appending.
**Other balances to check:** None in this module, but similar risk may exist in webhook handlers if added in the future.
