## 2024-08-01 — Cryptographic & Structural Patterns
**Risk identified:** Naive string concatenation with custom delimiters (`|`) for hashing allows delimiter injection (structural spoofing). Using `Math.random()` for unique IDs is predictable and prone to collisions.
**Migration target:** Structured serialization (`JSON.stringify`) for deterministic, unambiguous data combinations and `globalThis.crypto.randomUUID()` for cryptographically secure UUIDs.
**Migrated this session:** `generateAuditHash` now serializes objects to prevent injection, and `createAuditLog` now generates true UUIDs.
**Remaining:** Review other occurrences of naive ID generation and structured data hashing across the repository.
**Next session:** Investigate and secure frontend components that might rely on weak ID generators (e.g. `Math.random`) for `key` props or cache busting.
