## 2025-02-28 — Concurrency Drift in Audit Logs
**Attacked:** `createAuditLog` in `src/utils/audit.ts`
**Found:** Missing validation of expected parent hash allows simultaneous updates from different clients to inadvertently overwrite or fork the audit trail without throwing an error (no Optimistic Concurrency Control). A later save could discard the earlier state completely if it just replaces the list, or if the list is appended blindly, the chronological chain of hashes breaks because the new item's `previousHash` is derived from stale state rather than the actual immediately preceding item.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Added `expectedParentHash` argument to enforce Optimistic Concurrency Control (OCC). Throw an error if a mismatch is detected between the requested parent and the actual tail of the logs array.
**Systemic pattern:** Read-modify-write patterns where the state must form an unbroken chain. Needs OCC passed explicitly.
