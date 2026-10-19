## 2024-07-14 — generateAuditHash function

**Complexity found:** A separate exported utility function `generateAuditHash` used exclusively by `createAuditLog`.
**Why it existed:** Historical abstraction layer intended to separate hashing logic from log creation, despite only having one consumer.
**Eliminated:** Removed `generateAuditHash` completely. The synchronous hashing logic is now inlined directly into `createAuditLog`, preserving exactly the same hash output behavior.
**Net change:** -11 lines deleted, 1 abstraction removed.
**Next target:** Evaluate `src/types.ts` for unused or overly complex interfaces that could be simplified or collapsed.
