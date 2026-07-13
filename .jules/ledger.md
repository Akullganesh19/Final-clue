## 2025-03-05 — Audit Trail Deduplication Fix
**Value type:** Audit Log Ledger (Action History)
**Drift risk found:** Retried requests or duplicated events could inject redundant entries into the chronological chain (`createAuditLog`), throwing off state alignment.
**Fix:** Introduced an `idempotencyKey` to explicitly deduplicate concurrent/retried identical actions and preserve array stability.
**Proven by:** Simulated an idempotency scenario with duplicate `createAuditLog` calls using the identical key; verified length and array reference equality in `src/utils/audit.test.ts`.
**Other balances to check:** Any downstream summary functions that aggregate event counts directly from the `AuditTrail` without intrinsic deduplication.
