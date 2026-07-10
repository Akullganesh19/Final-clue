## 2026-07-10 — Audit Log Idempotency Guard
**Value type:** Audit Trail entries / Ledger history
**Drift risk found:** The `createAuditLog` function lacked an idempotency key. If an operation was retried or repeated (e.g., via a double-click or webhook retry), a duplicate audit ledger entry would be created because the function acted purely as an append-only operation with no deduplication logic.
**Fix:** Added an optional `idempotencyKey` to the `AuditTrail` interface and `createAuditLog` function. The function now scans the existing logs array for this key and returns the unmodified cached logs array if the key already exists, safely preventing data drift.
**Proven by:** A concurrency test in `src/utils/audit.test.ts` where the same operation with the same idempotency key is triggered twice, verifying the array is not duplicated and returns the exact same reference.
**Other balances to check:** None explicitly found, but any future ledger systems that append records should also adopt this caller-provided idempotency key approach.
