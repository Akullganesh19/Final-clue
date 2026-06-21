## 2026-06-21 — Blockchain-style Audit Hashing
**Complexity found:** Custom bitwise string hashing and cryptographic-style chain state (`generateAuditHash` and previous-hash linking) built into a frontend utility (`src/utils/audit.ts`).
**Why it existed:** Added as a "blockchain-style audit logging" feature (as noted in README), which is security theater on the client side since client data can always be tampered with regardless of client-side hashing.
**Eliminated:** The `generateAuditHash` function, hash chaining logic in `createAuditLog`, and the `hash` property in the `AuditTrail` type.
**Net change:** Removed 20 lines of hashing complexity and 1 abstraction.
**Next target:** Derived state redundancy in linkage confidences.
