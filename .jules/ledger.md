## 2024-03-24 — Audit Ledger Concurrency Integrity
**Value type:** AuditTrail / Ledger logs
**Drift risk found:** Read-then-write race condition when multiple asynchronous operations try to log to the audit trail concurrently without a locking mechanism or parent hash expectation.
**Fix:** Implemented Optimistic Concurrency Control (OCC) by passing and strictly validating the `expectedParentHash` on every append, preventing concurrent drifts. Additionally migrated to native Crypto API and introduced PII redaction layer.
**Proven by:** Tests demonstrating failure on mismatched hash expectations and passing for legitimate consecutive sequences.
**Other balances to check:** Any asynchronous state modification involving arrays or multi-step operations in `src/utils/`.
