## 2025-03-01 — Migrate Audit Hash to Web Crypto API
**Risk identified:** Custom synchronous bitwise hash and Math.random() IDs are insecure and ecosystem has moved away from them.
**Migration target:** Web Crypto API (crypto.subtle.digest for SHA-256 and crypto.randomUUID for IDs).
**Migrated this session:** Added async equivalents generateAuditHashAsync and createAuditLogAsync to src/utils/audit.ts.
**Remaining:** Update call sites across the application to await the new async methods and remove the old synchronous methods.
**Next session:** Identify and migrate UI components or controllers invoking createAuditLog to use the async version.
