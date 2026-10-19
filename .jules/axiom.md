## 2026-06-27 — Client-Side Audit Hashing
**Complexity found:** `generateAuditHash` manually rolling a 32-bit integer hash on the client and weaving `previousHash` through audit logs.
**Why it existed:** Attempting to build an immutable audit chain or verify integrity on the client side.
**Eliminated:** Removed `generateAuditHash` entirely and simplified `createAuditLog` to only append standard structured data. Removed `hash` from `AuditTrail` type.
**Net change:** -16 lines, 1 complex custom hashing abstraction eliminated.
**Next target:** Redundant type abstractions or unneeded helper wrappers around built-ins.
