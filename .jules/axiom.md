## 2024-05-24 — Client-Side Audit Hashing
**Complexity found:** A custom bitwise hashing function (`generateAuditHash`) and hash chain logic (`previousHash`) for audit logs on the client side.
**Why it existed:** Likely implemented as security theater to prevent tampering of audit logs by chaining hashes.
**Eliminated:** The `hash` property from `AuditTrail`, the `generateAuditHash` function, and the hash chaining logic in `createAuditLog`.
**Net change:** -16 lines deleted, 1 abstraction (client-side hash chain) removed.
**Next target:** Identify other pseudo-security mechanisms or over-engineered client-side data derivations that do not provide actual security.
