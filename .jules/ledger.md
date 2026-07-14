## 2024-05-18 — Audit Trail Idempotency

**Value type:** System Audit/Action Log (Immutable event ledger)
**Drift risk found:** The `createAuditLog` pure function acted as an array appender without validating duplicate events. Since it didn't require an idempotency key, double-clicks, concurrent requests, or replayed webhooks could cause identical actions to be logged twice, inflating the evidence history and creating an untrustworthy final case state.
**Fix:** Added an explicit, required `idempotencyKey` parameter to the `createAuditLog` signature. Searched the existing state for the key and returned the exact unmodified array reference if found to safely deduplicate identical operations.
**Proven by:** Created `src/utils/audit.test.ts` to simulate a double-webhook request. Confirmed the second invocation correctly returned the unmodified array reference instead of appending a duplicate log.
**Other balances to check:** Any linkage updates or case status state changes outside the audit log that might be lacking idempotency keys or atomic mutations.
