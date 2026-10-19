## 2025-02-26 — Cryptographic primitives migration
**Risk identified:** The audit log ID generation uses naive `Date.now() + Math.random()` combinations which risk concurrency collisions. The hashing algorithm uses a custom rolling 32-bit integer bitwise operation which is mathematically weak and computationally non-standard, creating a security risk and lagging behind modern standard cryptography APIs.
**Migration target:** Modern standard Web Crypto API (`globalThis.crypto.randomUUID()` for unique identifiers and `globalThis.crypto.subtle.digest` for SHA-256 hashing).
**Migrated this session:** Replaced the naive pseudo-random ID generation in `createAuditLog` with `globalThis.crypto.randomUUID()`. Introduced an additive asynchronous hashing function `generateAuditHashAsync` utilizing the modern Web Crypto API parallel to the old function.
**Remaining:** Migrate all existing synchronous call sites to the new `generateAuditHashAsync` function and fully remove the old `generateAuditHash` function.
**Next session:** Start migrating the callers of `generateAuditHash` to the new `generateAuditHashAsync` function.
