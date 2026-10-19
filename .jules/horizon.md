## 2026-07-10 — Cryptographic Hash Migration
**Risk identified:** The current `generateAuditHash` uses a custom, weak 32-bit integer string hash and manual string concatenation (`${previousHash}|...`), which is susceptible to delimiter injection attacks and hash collisions. It also truncates the result to 8 characters.
**Migration target:** Web Crypto API's SHA-256 with full 64-character hex strings, and `JSON.stringify` for safe array concatenation.
**Migrated this session:** Added asynchronous additive variants `generateAuditHashAsync` and `createAuditLogAsync` alongside the legacy synchronous functions.
**Remaining:** Migrate call sites of `createAuditLog` to `createAuditLogAsync`, then remove the legacy synchronous variants.
**Next session:** Identify and update call sites that consume `createAuditLog` to use the new async variant.
