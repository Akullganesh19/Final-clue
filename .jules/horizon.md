## 2025-02-28 — Web Crypto API Migration for Audit Logs
**Risk identified:** Using Math.random() for UUID generation and synchronous bitwise string operations for hashing in audit logs is insecure, prone to collisions, and outdated.
**Migration target:** Modern standard Web Crypto API (globalThis.crypto.randomUUID and globalThis.crypto.subtle.digest).
**Migrated this session:** Migrated src/utils/audit.ts to use async Web Crypto API for SHA-256 hashing and randomUUID for ID generation.
**Remaining:** No remaining items for this module.
**Next session:** Look for other instances of Math.random() being used for identity or cryptographic purposes.
