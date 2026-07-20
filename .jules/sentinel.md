## 2024-05-24 — Delimiter Injection and Concurrency ID Collisions in Audit Logs
**Attacked:** `src/utils/audit.ts` (`generateAuditHash` and `createAuditLog`)
**Found:** Delimiter injection in audit hash generation due to simple string concatenation, and ID collisions on high-concurrency logging using `Date.now() + Math.random()`.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Used `JSON.stringify` for serialization in hashes to eliminate delimiter injection, and replaced ID generation with `crypto.randomUUID()` to prevent concurrency collisions.
**Systemic pattern:** Look for other custom hash implementations or weak pseudo-random ID generators using `Math.random()` in sensitive domains (like audit or auth paths).
