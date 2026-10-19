## 2025-03-09 — Web Crypto API Migration for Audit Logs
**Risk identified:** The current `generateAuditHash` uses a custom, vulnerable, and synchronous bitwise hashing algorithm which could lead to hash collisions and blocks the main thread.
**Migration target:** Modern, asynchronous hashing utilizing the native Web Crypto API (`crypto.subtle.digest` with SHA-256).
**Migrated this session:** Implemented `generateAuditHashAsync` and `createAuditLogAsync` using SHA-256 natively in `src/utils/audit.ts` alongside tests.
**Remaining:** Migrate existing callers of `createAuditLog` to use `createAuditLogAsync`, and then safely deprecate and remove the old synchronous versions once everything is migrated.
**Next session:** Find caller sites (e.g., `App.tsx` or similar orchestrators using audit logging) and update them to await the new async audit logger.
