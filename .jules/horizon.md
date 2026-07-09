## 2024-05-18 — Migrate audit hashing to Web Crypto SHA-256
**Risk identified:** The current audit hashing algorithm uses a custom 32-bit integer string encoding that truncates to 8 characters and builds the source string using naive delimiter concatenation (`|`). This is weak, vulnerable to delimiter injection attacks, mathematically lacking collision resistance, and generally insecure for audit log integrity.
**Migration target:** Modern Web Crypto API using SHA-256 and proper array serialization (`JSON.stringify([previousHash, action, details, author, timestamp])`).
**Migrated this session:** Built `generateAuditHashAsync` and `createAuditLogAsync` alongside the existing synchronous methods in `src/utils/audit.ts` to enable an additive migration.
**Remaining:** Migrate call sites that construct audit logs across the application to switch from `createAuditLog` to `createAuditLogAsync`. Remove the legacy synchronous methods once fully replaced.
**Next session:** Start migrating specific controllers/services that log audit trails to use the new `createAuditLogAsync`.
