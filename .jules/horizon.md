## 2025-03-02 — Audit Trail Hashing Migration
**Risk identified:** The custom string hashing algorithm used for the blockchain-style audit logs converts to a 32-bit integer via naive bitwise operations. This is highly vulnerable to collisions and will compromise log integrity over time, making it an unacceptable technical debt.
**Migration target:** Migrate to a standardized, stronger synchronous hashing algorithm (FNV-1a 32-bit) to preserve the synchronous contract (avoiding async contagion) while significantly improving collision resistance.
**Migrated this session:** Introduced generateAuditHashV2 implementing FNV-1a. Switched new log generation in createAuditLog to use V2. Marked V1 as deprecated.
**Remaining:** Validate historical audit logs using V1. Re-sign or migrate historical chains to V2. Remove V1 entirely.
**Next session:** Implement migration script to re-sign historical audit logs in storage and update all references to use V2 exclusively.
