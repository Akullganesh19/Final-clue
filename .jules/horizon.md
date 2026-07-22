## 2024-05-24 — Web Crypto API Migration
**Risk identified:** The current audit hashing logic uses a custom, synchronous bitwise shifting algorithm that is prone to collision and represents a legacy approach to hashing.
**Migration target:** The Web Crypto API (`globalThis.crypto.subtle.digest`), which is the modern standard for cryptographic hashing in JavaScript environments, providing secure, native, asynchronous hashing.
**Migrated this session:** Added `generateAuditHashAsync` utilizing the Web Crypto API alongside the original synchronous method. Verified it works and returns correctly formatted SHA-256 strings.
**Remaining:** Refactor call sites (like `createAuditLog`) to be async and consume the new async hash function.
**Next session:** Migrate `createAuditLog` to `createAuditLogAsync` and update all components that rely on it to handle promises.
