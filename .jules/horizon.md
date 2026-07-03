## 2025-02-28 — Web Crypto API Migration for Audit Ledger
**Risk identified:** The audit ledger uses a custom, vulnerable bitwise hash function (`generateAuditHash`) for cryptographic signatures, and legacy `Date.now() + Math.random()` for unique identifiers. These patterns are brittle, insecure, and non-standard.
**Migration target:** The ecosystem is moving towards the native Web Crypto API (`crypto.subtle.digest` with SHA-256) for secure hashing and `crypto.randomUUID()` for unique identifiers.
**Migrated this session:** Implemented `generateAuditHashAsync` and `createAuditLogAsync` using the Web Crypto API, laying the groundwork for an additive migration alongside the existing legacy synchronous methods.
**Remaining:** Migrate all call-sites of `createAuditLog` to use `createAuditLogAsync`.
**Next session:** Start replacing occurrences of `createAuditLog` in components and backend code with `await createAuditLogAsync()`, handling any required async cascading throughout the system.
