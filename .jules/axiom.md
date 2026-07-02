## 2026-07-02 — Client-side audit hashing
**Complexity found:** The `generateAuditHash` function and the `hash` property in `AuditTrail` were implementing a client-side blockchain-style hashing mechanism for logs.
**Why it existed:** Likely an attempt to provide tamper-evident logs for the cold case evidence triage system.
**Eliminated:** The `generateAuditHash` function, the `hash` property generation logic in `createAuditLog`, and the `hash` property in the `AuditTrail` interface. The fragile `Date.now()` combined with `Math.random()` ID generation was also replaced with native `crypto.randomUUID()`.
**Net change:** -15 lines of code, 1 abstraction eliminated (client-side hashing).
**Next target:** Evaluate state management for derived state that could be eliminated.
