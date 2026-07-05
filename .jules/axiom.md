## 2024-05-18 — Client-Side Hash Chaining
**Complexity found:** `generateAuditHash` function and client-side chaining via `hash` and `previousHash` in `src/utils/audit.ts` and `src/types.ts`.
**Why it existed:** Attempted to provide security and integrity via a hash chain, acting as security theater since client-side hashing provides no real protection against tampering.
**Eliminated:** Entire custom bitwise hashing function `generateAuditHash`, reading `previousHash` from previous log, hash calculation on new log creation, and the `hash` string property on the `AuditTrail` interface.
**Net change:** -16 lines deleted, 1 abstraction eliminated.
**Next target:** Any duplicate or redundant event mapping or middleware layers.
