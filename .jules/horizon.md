## 2025-03-01 — Delimiter Injection Security Risk Migration

**Risk identified:** The `generateAuditHash` function combined fields via string interpolation with generic separators (`|`). This is a classic source of delimiter injection, causing silent hash collisions.
**Migration target:** The modern ecosystem standard is to safely serialize objects for signature or hashing using deterministic techniques. We migrate away from generic string interpolation towards strict serialization with `JSON.stringify`.
**Migrated this session:** The core input serialization logic in `generateAuditHash` within `src/utils/audit.ts` was updated to securely combine strings via array serialization with `JSON.stringify` instead of concatenating strings. This prevents data corruption during combination.
**Remaining:** Migrate away from the custom bitwise custom hashing loop to a standard, modern, asynchronous Web Crypto API SHA-256 hash `crypto.subtle.digest`.
**Next session:** Make the `createAuditLog` callers handle promises and swap out the bitwise `generateAuditHash` for an async SHA-256 Digest using the Web Crypto API.
