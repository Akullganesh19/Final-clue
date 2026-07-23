## 2025-02-27 — Async Crypto Audit Hash Migration
**Risk identified:** The legacy audit trail relies on a custom, synchronous 32-bit bitwise hashing function and naive pseudo-random ID generation. This risks hash collisions, security vulnerabilities, and main-thread blocking as log volume grows.
**Migration target:** The ecosystem is moving toward standard, asynchronous Web Crypto APIs (`globalThis.crypto.subtle.digest`) for secure hashing, and `globalThis.crypto.randomUUID()` for robust collision-resistant IDs.
**Migrated this session:** Implemented parallel, asynchronous versions of the audit utilities (`generateAuditHashAsync` and `createAuditLogAsync`) utilizing the Web Crypto API alongside the legacy synchronous ones to provide a safe, backward-compatible migration path.
**Remaining:** Update call sites throughout the application to switch from `createAuditLog` to `createAuditLogAsync`, and then remove the old synchronous implementations.
**Next session:** Start replacing synchronous calls in `src/agents/` and other mutation pipelines with `await createAuditLogAsync()`.
