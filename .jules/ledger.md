## 2024-07-05 — Audit Trail Integrity

**Value type:** Audit Log Chain
**Drift risk found:** Read-modify-write on the audit log array without Optimistic Concurrency Control (OCC) or idempotency. Concurrent requests could result in overwritten logs (loss of history), and retried requests could result in duplicate logs.
**Fix:** Added `expectedLength` for OCC and `idempotencyKey` for idempotency to `createAuditLog`.
**Proven by:** `src/utils/audit.test.ts` (simulated concurrent request and simulated retry).
**Other balances to check:** Any other places where arrays are appended to or state is mutated in a multi-step process without a transaction or OCC.
