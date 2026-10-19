## 2024-03-24 — Audit Log Hashing Complexity
**Complexity found:** Custom string hashing function (`generateAuditHash`) inside `src/utils/audit.ts` attempting to create a pseudo-cryptographic chain of logs.
**Why it existed:** Presumably added to make audit logs look like a blockchain or to detect tampering, but it uses a very weak 32-bit integer bitwise hash that provides no actual cryptographic security, and the hash isn't verified anywhere in the codebase.
**Eliminated:** Removed `generateAuditHash` entirely and simplified `createAuditLog` to just generate the log entry without the fake hashing mechanism.
**Net change:** -15 lines deleted, 1 abstraction removed.
**Next target:** Evaluate if `createAuditLog` itself is actually needed if logs are just appended to an array in memory.
