## 2024-07-04 — Client-Side Audit Hashing
**Complexity found:** A client-side hashing mechanism (`generateAuditHash`) that chained audit logs together using an Optimistic Concurrency Control-like concept but in an isomorphic/client context where it provides zero actual security or integrity.
**Why it existed:** Likely an attempt to create a blockchain-style audit log or tamper-evident trail, but fundamentally flawed because client-side hashes can be trivially recalculated by any attacker.
**Eliminated:** The `generateAuditHash` function, the `hash` property on `AuditTrail`, and the chaining logic (`previousHash`).
**Net change:** -18 lines removed, 1 abstraction (`generateAuditHash`) eliminated.
**Next target:** Explore `src/types.ts` and React components for any other redundant abstractions or "security theater" layers.
