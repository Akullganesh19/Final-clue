## 2025-03-05 — generateAuditHash abstraction

**Complexity found:** A standalone exported function `generateAuditHash` in `src/utils/audit.ts` used solely for generating a hash for audit logs.
**Why it existed:** Likely an attempt to separate hashing logic from the rest of the audit log creation process, creating an unnecessary abstraction layer and an extra exported function for a process used exactly once.
**Eliminated:** The `generateAuditHash` function was deleted, and its core hashing logic was inlined directly into `createAuditLog`.
**Net change:** Removed 1 abstraction, -10 lines removed, +8 lines added (net -2 lines).
**Next target:** Any other standalone single-use utility functions in the `utils` directory.
