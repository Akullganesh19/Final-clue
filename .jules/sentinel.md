## 2026-07-13 — Audit Log Hash Delimiter Injection & Idempotency Gap
**Attacked:** src/utils/audit.ts (createAuditLog, generateAuditHash)
**Found:** 1) `createAuditLog` allowed exact duplicates to be pushed to the ledger on retried requests, violating integrity. 2) `generateAuditHash` used simple `|` concatenation, allowing an attacker to perfectly spoof a valid hash by shifting `|` delimiters inside string payloads (e.g. `action: "UPDATE|admin"`, `details: "admin"` vs `action: "UPDATE"`, `details: "admin|admin"`).
**Severity:** 🔴
**Fixed or flagged:** Fixed. Added `idempotencyKey` guard to `createAuditLog` and converted `generateAuditHash` payload combining to `JSON.stringify` serialization.
**Systemic pattern:** String concatenation for hash or signature generation in other utilities. Check any other data signatures or token generators.
