## 2025-03-01 — Idempotency key for AuditTrail logs
**Value type:** Event ledger (AuditTrail array)
**Drift risk found:** createAuditLog lacked an idempotency key, meaning if an operation was retried (e.g. concurrent request, retry, replayed webhook), the same log entry could be duplicated in the audit trail, causing drift in the event ledger.
**Fix:** Added an idempotency key to createAuditLog and the AuditTrail interface, throwing an error if it is missing, and skipping appending if a log with the same key already exists.
**Proven by:** A concurrency test in `src/utils/audit.test.ts` where we simulated appending the same action twice with the same idempotency key and confirmed the second call was deduplicated and returned the same array.
**Other balances to check:** Any other mutable state arrays (e.g., case linkage states) should also be checked for similar drift mechanisms.