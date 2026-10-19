## 2024-05-24 — Additive Hash Algorithm Migration
**Risk identified:** Naive string concatenation with delimiters in `generateAuditHash` allows structural equivalences and delimiter injection, risking validation bypass. This ages poorly as attack vectors mature.
**Migration target:** Structured serialization via `JSON.stringify` in a new `generateAuditHashV2` function, maintaining schema versioning (`hashVersion: 2`) for append-only logs.
**Migrated this session:** Added `generateAuditHashV2` function and appended `hashVersion?: number` to `AuditTrail` interface. The generator `createAuditLog` is NOT updated to use V2 yet to prevent breaking downstream validators.
**Remaining:** Verify all downstream validation and read pathways to accommodate and explicitly handle V2 hashes, while ensuring legacy logs continue validating with `generateAuditHash`. After readers are updated, update `createAuditLog` to emit V2 hashes.
**Next session:** Investigate the retrieval and validation logic of the audit logs to handle multiple hash versions robustly.
