## 2026-06-30 — Client-side Audit Hashing
**Complexity found:** A custom bitwise hashing function (`generateAuditHash`) that ran on the client to simulate blockchain-style linkage for the `AuditTrail` interface.
**Why it existed:** It was originally implemented to provide a "blockchain-style audit logging" feeling (as mentioned in README.md), giving an illusion of tamper-evidence on the frontend.
**Eliminated:** The `generateAuditHash` function, its call site, and the `hash` field from the `AuditTrail` type.
**Net change:** Removed 1 abstraction, deleted 15 lines of unnecessary complexity.
**Next target:** Any other pseudo-security or over-engineered logging on the client side.
