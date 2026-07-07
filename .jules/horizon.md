## 2025-03-09 — Crypto Hash API Migration
**Risk identified:** The current hashing algorithm (`generateAuditHash` using string concatenation and custom bitwise operations) creates weak, mathematically insecure checksums vulnerable to collisions and delimiter injection, while failing to align with modern browser and node-native cryptographic standards.
**Migration target:** The modern Web Crypto API (`crypto.subtle.digest` with SHA-256) combined with array-based `JSON.stringify` to safely combine inputs natively without delimiter collision.
**Migrated this session:** Added async variants `generateAuditHashAsync` and `createAuditLogAsync` using SHA-256 in `src/utils/audit.ts` to provide a clear additive migration path.
**Remaining:** Migrate current and future call-sites in `src/utils/audit.ts` or other modules to use `createAuditLogAsync`, and ultimately deprecate and remove the synchronous variants.
**Next session:** Start migrating synchronous callers of `createAuditLog` to `createAuditLogAsync` where feasible.
