## 2025-07-30 — Concurrent Audit Log ID Collision
**Attacked:** `createAuditLog` in `src/utils/audit.ts`
**Found:** Audit log IDs were generated using `Date.now()` and `Math.random() * 1000`, which leads to guaranteed ID collisions when multiple events are logged within the same millisecond. This compromises the integrity of the audit trail.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced the insecure ID generation with cryptographically secure UUIDs (`globalThis.crypto.randomUUID()`).
**Systemic pattern:** Search for other uses of `Date.now()` and `Math.random()` for ID generation, especially in distributed or concurrent contexts.
