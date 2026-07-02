## 2026-07-02 — Cryptographic Auditing Migration
**Risk identified:** `src/utils/audit.ts` uses an insecure custom bitwise hash for audit logs and `Math.random()` for IDs. The non-standard custom hashing is vulnerable to collisions. `Math.random()` with `Date.now()` is a legacy approach for unique identifiers.
**Migration target:** The ecosystem is moving toward standardized native Web Crypto APIs (`crypto.subtle.digest` with SHA-256 for secure hashing, and `crypto.randomUUID()` for unique identifiers).
**Migrated this session:** Added asynchronous variants `generateAuditHashAsync` and `createAuditLogAsync` using modern Web Crypto APIs alongside the existing synchronous functions to support a safe "additive migration".
**Remaining:** Refactor call sites using the synchronous `createAuditLog` to leverage `createAuditLogAsync`, then eventually deprecate and remove the old synchronous methods.
**Next session:** Identify call sites using the legacy `createAuditLog` and begin updating them one-by-one to safely await the new `createAuditLogAsync`.
