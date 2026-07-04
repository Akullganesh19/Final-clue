## 2024-03-20 — Systemic Audit Logging Flaws
**Attacked:** `src/utils/audit.ts` (`createAuditLog` and `generateAuditHash`)
**Found:**
1. `createAuditLog` crashed when provided a `null` logs array, exposing the application to crashes on startup or empty states.
2. `generateAuditHash` used simple string concatenation with `|` delimiters, allowing forged hashes via delimiter injection.
3. `createAuditLog` wrote PII (emails, SSNs, credit cards, phones) in plaintext to the audit logs, failing its compliance requirement.
4. `generateAuditHash` uses a weak, custom bitwise mathematical algorithm for hashing instead of a secure cryptographic hash (like SHA-256 via Web Crypto API).
**Severity:** 🔴 (Items 1-3 were exploitable/critical, Item 4 is Latent/Theoretical)
**Fixed or flagged:** Fixed Items 1-3. Implemented `redactPII`, handled `null` arrays, and switched string building to `JSON.stringify` for collision prevention. Flagged Item 4 for human review/future migration to an asynchronous `createAuditLogAsync` using `crypto.subtle.digest`.
**Systemic pattern:** Ensure all other areas parsing inputs or generating unique IDs are not using simplistic string concatenation or bitwise operations that can be easily predicted or collided.
