## 2025-03-03 — Audit Trail Hash Migration
**Risk identified:** The homemade 32-bit integer string hash (`generateAuditHash`) used for blockchain-style audit logging is highly vulnerable to collisions, undermining the integrity of the audit trail.
**Migration target:** A stronger synchronous hashing algorithm (FNV-1a 32-bit) combined with structured serialization, avoiding async contagion from `crypto.subtle.digest`.
**Migrated this session:** Built the new `generateSecureAuditHash` function utilizing FNV-1a alongside the legacy generator.
**Remaining:** Update `createAuditLog` to use the new hash generator. Migrate any hardcoded verification consumers to support the `CHK-V2-` prefix. Remove the deprecated `generateAuditHash`.
**Next session:** Switch `createAuditLog` to use `generateSecureAuditHash` and update any downstream validators to handle the new format.
