## 2025-03-08 — [Audit Trail OCC and Idempotency]
**Value type:** Audit Log / Trail
**Drift risk found:** Read-modify-write on a balance with no locking or atomic operation (classic race condition), combined with a lack of idempotency keys allowing duplicate entries on retry.
**Fix:** Added an `expectedLength` parameter for Optimistic Concurrency Control (OCC) to prevent concurrent writes causing drift, and an `idempotencyKey` parameter to ensure retries of the same request don't append duplicates.
**Proven by:** Two explicit tests in `src/utils/audit.test.ts`—one that simulates concurrent writes leading to an OCC drift error, and another that simulates a duplicated webhook/retry where the idempotency key causes a no-op instead of double entry.
**Other balances to check:** Any other mutable array representations or states stored in the database representing lists of transactions or linkages that could drift under concurrent edits.