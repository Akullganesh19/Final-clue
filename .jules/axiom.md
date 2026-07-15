## 2024-05-24 — Eliminated generateAuditHash abstraction
**Complexity found:** A separate utility function `generateAuditHash` existed in `src/utils/audit.ts` to calculate the audit log hash.
**Why it existed:** It was likely created with the intention of separating the hash calculation logic from the audit log creation, or potentially to be reused elsewhere, although it was only used in one place (`createAuditLog`).
**Eliminated:** The `generateAuditHash` function was removed and its synchronous hashing logic (string concatenation and bitwise `for` loop) was inlined directly into `createAuditLog`.
**Net change:** Removed 1 abstraction, deleted ~10 lines of code (function signature, return statement, and separate function block), and added the core logic directly to the consumer.
**Next target:** Look for single-use React wrapper components or duplicate state management.
