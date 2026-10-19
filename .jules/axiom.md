## 2026-07-01 — Client-Side Audit Hashing
**Complexity found:** A bespoke string-concatenation and bitwise math client-side hashing system used for the `AuditTrail` records.
**Why it existed:** Assumed to provide blockchain-like integrity for logs by calculating a hash based on the previous hash and current event properties.
**Eliminated:** The entire client-side `generateAuditHash` mechanism and all related parent/child hash-tracking inside `createAuditLog`, as client-side hashing provides zero actual security or integrity guarantees. Also deleted the `hash` field from the `AuditTrail` type. Legacy ID generation using `Date.now()` + `Math.random()` was also simplified to native `crypto.randomUUID()`.
**Net change:** -18 lines of code removed, 1 abstraction layer (`generateAuditHash`) eliminated, and 1 interface property deleted.
**Next target:** Evaluate client-side `SystemWeights` usage for potential derived-state simplifications.
