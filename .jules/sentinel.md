## 2026-07-23 — Audit Log Collisions
**Attacked:** src/utils/audit.ts (generateAuditHash and createAuditLog)
**Found:** Delimiter injection allows hash collisions. Naive Math.random() + Date.now() allows ID collisions.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced string concatenation with JSON.stringify and replaced pseudo-random ID with globalThis.crypto.randomUUID().
**Systemic pattern:** Look for naive string concatenations in cryptographic/hash functions and Date.now() used for unique IDs across the codebase.
