## 2025-07-03 — Client-side audit hashing
**Complexity found:** Custom bitwise hashing algorithm (`generateAuditHash`) and client-side hash chains on audit logs (`hash` property on `AuditTrail`).
**Why it existed:** Attempt to create an immutable ledger / chain of custody on the client side.
**Eliminated:** `generateAuditHash` function and the `hash` property. Client-side ID generation replaced with standard `crypto.randomUUID()`.
**Net change:** -15 lines, 1 abstraction removed.
**Next target:** Any other security theater or over-engineered boilerplate hiding in utilities or types.
