## 2025-02-28 — ID Concurrency Collision & Delimiter Injection
**Attacked:** `src/utils/audit.ts` (`createAuditLog` and `generateAuditHash`)
**Found:** 1) `Date.now() + Math.random()` leads to ID collisions under concurrency. 2) Pipe delimiters `|` allow hash collision injection.
**Severity:** 🔴
**Fixed or flagged:** ID concurrency is fixed by using `globalThis.crypto.randomUUID()`. Delimiter injection is flagged for human review.
**Systemic pattern:** Use of naive Math.random() for IDs and weak custom hashing across the application.
