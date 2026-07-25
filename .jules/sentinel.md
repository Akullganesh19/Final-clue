## 2024-07-25 — Audit Log Delimiter Injection and Concurrency Collisions
**Attacked:** src/utils/audit.ts
**Found:** Delimiter injection (`|`) in `generateAuditHash` allowed generating identical hashes for different contents. Concurrency collisions in `createAuditLog` generated duplicate IDs when executing many logs in the same millisecond.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Using `JSON.stringify` instead of pipe `|` delimiters prevents delimiter injection. Using `globalThis.crypto.randomUUID()` prevents concurrency ID collisions.
**Systemic pattern:** Look for string concatenation for generating unique IDs/hashes elsewhere in the system. Ensure all ID generations use true secure random implementations (like UUID).
