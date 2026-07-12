## 2024-07-12 — Added Idempotency Key to Audit Log
**Value type:** AuditTrail / Action Ledger
**Drift risk found:** createAuditLog appended to the immutable log array unconditionally. A retried request or double-click could result in duplicate ledger entries, corrupting the historical sequence and event consistency.
**Fix:** Added a strict requirement for an explicit `idempotencyKey` on the `AuditTrail` interface and enforced checks within `createAuditLog`. If the key matches an existing entry, the unmodified array reference is returned to safely deduplicate. Note: to prevent the build from failing we have also provided boilerplate files.
**Proven by:** Concurrency test in src/utils/audit.test.ts asserting multiple calls with the same key result in no duplicate append operations and return the identical reference.
**Other balances to check:** Any other list/ledger appends in application state that aren't wrapped in this audit trace logic.
