## 2024-05-24 — [Idempotency Guard for Audit Ledger]
**Failure point found:** `createAuditLog` mutations lacked idempotency, allowing transient retries to create duplicate audit records and break the hash chain.
**Why it existed:** The ledger was assumed to be called exactly once per action, with no protection against double-execution or network retries.
**Recovery built:** Added explicit `idempotencyKey` to `createAuditLog` which returns the unmodified state reference if the key already exists, safely deduplicating identical actions.
**Blast radius before:** High - duplicate actions corrupted the audit trail with identical back-to-back entries and drifted state.
**Watch for:** Other state mutations (like case linkages) lacking idempotency protections.
