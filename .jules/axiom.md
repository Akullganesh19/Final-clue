## 2025-03-09 — Client-side Audit Hashing
**Complexity found:** A custom client-side hashing mechanism (`generateAuditHash`) that chained audit logs together using a `previousHash` to simulate a blockchain or tamper-proof ledger, which added complexity to the `AuditTrail` interface and log generation process.
**Why it existed:** It was likely built under the assumption that client-side hash chaining would provide security, act as a tamper-evident mechanism, or fulfill Optimistic Concurrency Control (OCC) needs.
**Eliminated:** The `generateAuditHash` function, the generation of `hash` and retrieval of `previousHash` inside `createAuditLog`, and the `hash` property on the `AuditTrail` interface.
**Net change:** -13 lines deleted, 1 abstraction removed (custom hashing).
**Next target:** Explore `src/components` or state management code to find derived state that doesn't need to be managed manually.
