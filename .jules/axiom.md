## 2026-06-22 — Client-Side Audit Hashing
**Complexity found:** A bespoke `generateAuditHash` function that creates a pseudo-cryptographic hash chain of audit logs on the client side, storing `hash` inside every `AuditTrail` entry.
**Why it existed:** Likely implemented to give a "blockchain-style" feeling of immutability and security to the audit logs.
**Eliminated:** The `generateAuditHash` function, the `hash` calculation logic in `createAuditLog`, and the `hash` property in the `AuditTrail` interface.
**Net change:** -15 lines deleted, 1 unnecessary abstraction (client-side hashing) removed.
**Next target:** Any other pseudo-security abstractions or unused component layers.
