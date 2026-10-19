## 2024-05-24 — Idempotency Guard for Audit Ledger
**Failure point found:** The append-only AuditTrail array could accept duplicate entries if operations were retried without validation.
**Why it existed:** The ledger assumed callers would safely manage their own retries and never accidentally execute the same `createAuditLog` invocation twice.
**Recovery built:** Added an `idempotencyKey` requirement to `createAuditLog`. The function now checks if the key already exists in the ledger and automatically discards the duplicate execution, returning the existing ledger while logging a warning.
**Blast radius before:** Any transient network failure resulting in a client retry would cause silent duplication in the system's core audit trail, corrupting case history over time.
**Watch for:** Other system areas, like `AgentLog` insertions, that might be accepting duplicate records due to missing idempotency checks.
