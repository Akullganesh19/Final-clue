## 2023-10-25 — Cryptographic Hash Migration
**Risk identified:** The legacy audit hash generator uses a weak custom bitwise shift algorithm and naive string concatenation (`|`), which is vulnerable to collisions and delimiter injection, aging poorly for immutable audit trails.
**Migration target:** A standard, future-proof SHA-256 algorithm via Web Crypto API with structured `JSON.stringify` serialization, paired with a schema versioning strategy (`hashVersion: 2`).
**Migrated this session:** Introduced `generateAuditHashV2` alongside legacy `generateAuditHash`. Since no downstream readers exist yet, immediately integrated `generateAuditHashV2` into the `createAuditLog` producer.
**Remaining:** Downstream validation modules or blockchain endpoints need to be built expecting `hashVersion: 2`, and any legacy log parsers must handle both versions.
**Next session:** Build the audit log verifier module that supports both legacy and V2 hashes.
