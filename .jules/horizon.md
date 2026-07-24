## 2024-07-24 — Crypto Migration
**Risk identified:** Custom synchronous hash function `generateAuditHash` is legacy and potentially vulnerable to collisions. It is a risky legacy decision that will become harder to migrate as more callers depend on its synchronous signature.
**Migration target:** Modern, secure Web Crypto API (`globalThis.crypto.subtle.digest('SHA-256')`) with an asynchronous signature.
**Migrated this session:** Added `generateAuditHashAsync` and `createAuditLogAsync` as additive parallel implementations.
**Remaining:** Migrate existing synchronous call sites to the new async functions, then remove the legacy sync functions.
**Next session:** Identify call sites of `createAuditLog` and update them to `await createAuditLogAsync`.
