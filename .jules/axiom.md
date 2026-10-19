## 2026-06-25 — Client-Side Hashing in Audit Trail
**Complexity found:** `generateAuditHash` function and client-side hashing logic in `src/utils/audit.ts`
**Why it existed:** Attempting to build an immutable, stable blockchain-like audit trail on the client side.
**Eliminated:** The custom hashing algorithm (`generateAuditHash`) and the `hash` field from the `AuditTrail` type.
**Net change:** -19 lines, 1 abstraction removed.
**Next target:** Any other client-side attempts at blockchain-like immutability.
