## 2024-05-15 — Audit Log SHA-256 Hashing Migration
**Risk identified:** The current audit log hashing uses a vulnerable 32-bit bitwise operation with manual string concatenation (`|`), which is prone to hash collisions and delimiter injection, violating security best practices for immutable audit trails.
**Migration target:** Standard Web Crypto API (`crypto.subtle.digest('SHA-256')`) for collision resistance and `JSON.stringify` for safe serialization of fields without delimiter injection risks.
**Migrated this session:** Added `generateAuditHashAsync` and `createAuditLogAsync` (additive migration slice) with SHA-256 and full 64-character hex strings in `src/utils/audit.ts`.
**Remaining:** Updating all existing usages (call sites) of `createAuditLog` to use `createAuditLogAsync` and handle the Promise resolution, followed by the removal of the legacy synchronous functions.
**Next session:** Identify and update all call sites across the application to await the new asynchronous audit logging functions.
