## 2026-07-10 — Client-side hash chaining in audit logs
**Complexity found:** Custom SHA-like hashing logic `generateAuditHash` and chaining state `previousHash` managed entirely on the client side in `src/utils/audit.ts`.
**Why it existed:** Assumed to provide security or immutability for the `AuditTrail`, but client-side generation provides no real security and acts only as security theater. True Occ/Validation must occur at the persistence layer.
**Eliminated:** `generateAuditHash` function and the `hash` field in `AuditTrail`. Refactored `createAuditLog` to simply populate required event properties without calculating a hash.
**Net change:** 1 abstraction removed, 16 lines deleted, 0 lines added.
**Next target:** Any other pseudo-security abstractions like client-side encryption or custom cryptography logic.
