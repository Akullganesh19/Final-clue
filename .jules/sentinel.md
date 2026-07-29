## 2023-10-27 — Audit Log ID Concurrency Bug
**Attacked:** src/utils/audit.ts createAuditLog
**Found:** Audit trail IDs used `Date.now() + Math.random()`, which causes frequent collisions if called concurrently, potentially overwriting or dropping critical audit logs.
**Severity:** 🔴
**Fixed or flagged:** Fixed by replacing with `globalThis.crypto.randomUUID()`.
**Systemic pattern:** Look for `Math.random` combined with `Date.now` for IDs across the codebase.
