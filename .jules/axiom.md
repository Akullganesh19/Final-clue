## 2025-03-08 — Client-side Audit Hash Chaining
**Complexity found:** Client-side hash generation and chaining in `AuditTrail` logs (e.g. `previousHash`, `hash`).
**Why it existed:** It was likely an attempt to provide Optimistic Concurrency Control (OCC) or tamper-evident logs on the frontend.
**Eliminated:** The `hash` property in `AuditTrail`, the `generateAuditHash` function, and the chaining logic inside `createAuditLog`.
**Net change:** -20 lines removed, 1 abstraction eliminated.
**Next target:** Any other pseudo-security measures on the client side that provide no real security value.
