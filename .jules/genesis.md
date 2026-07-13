## 2023-07-13 — AuditTrail Ledger Drift
**Failure point found:** The `createAuditLog` method in `src/utils/audit.ts` appended to the append-only `AuditTrail` array without idempotency checks.
**Why it existed:** Assumed synchronous UI paths without network retries, failing to account for React Strict Mode double-invocations or asynchronous multi-agent retry loops.
**Recovery built:** Implemented an idempotency guard using a required `idempotencyKey` that deduplicates retry attempts and safely returns the unmodified `logs` reference on conflict.
**Blast radius before:** Any automated agent retry or UI mis-click would permanently pollute the cryptographic audit hash chain, corrupting the case ledger for all investigators.
**Watch for:** Other in-memory append-only structures like agent linkage arrays or critic flags that might be mutated multiple times in a retry loop.
