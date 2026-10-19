## 2025-03-08 — Audit Hash Delimiter Injection & ID Concurrency Collision
**Attacked:** `src/utils/audit.ts` (`generateAuditHash` and `createAuditLog`)
**Found:**
1. `generateAuditHash` concatenated fields with `|`, allowing malicious input containing `|` to collide hashes (e.g. `A|B, C` vs `A, B|C`).
2. `createAuditLog` generated IDs using `Date.now() + Math.random() * 1000`, causing ID collisions under high concurrency.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced `|` concatenation with `JSON.stringify` for hashes, and `Math.random` with `crypto.randomUUID()` for unique ID generation. Regression tests created.
**Systemic pattern:** Look for other custom string parsers/hasher relying on simple delimiters, or other naive random-based ID generators across the codebase.
