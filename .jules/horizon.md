## 2025-03-01 — Synchronous Audit Hash Migration
**Risk identified:** The audit log generator relies on a weak, custom 32-bit integer hash and manual string concatenation, which is vulnerable to collisions.
**Migration target:** A stronger synchronous hashing algorithm (FNV-1a) with structured serialization (JSON.stringify) to preserve the synchronous contract without introducing async contagion in the frontend.
**Migrated this session:** Added generateModernAuditHash utilizing FNV-1a and JSON.stringify, and migrated createAuditLog to use it.
**Remaining:** Deprecate and eventually remove the legacy generateAuditHash function once all potential external consumers are migrated.
**Next session:** Identify any external call sites still using generateAuditHash and migrate them to generateModernAuditHash, then safely delete the legacy function.
