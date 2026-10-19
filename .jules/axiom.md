## 2026-06-19 — Client-side Audit Hashing
**Complexity found:** A custom string-hashing algorithm (`generateAuditHash`) that implemented a local "blockchain" by chaining a `previousHash` into each new log entry.
**Why it existed:** Likely added to provide an "Audit Trail" with immutability guarantees. However, this is a client-side application. Immutability cannot be guaranteed by the client, as client memory and execution environments are inherently mutable and untrusted. This was security theater.
**Eliminated:** The `hash: string` property in `AuditTrail` (`src/types.ts`), the `generateAuditHash` function, and all custom hashing logic in `createAuditLog` (`src/utils/audit.ts`).
**Net change:** Deleted ~16 lines, 1 abstraction eliminated.
**Next target:** Any other pseudo-security abstractions or state management redundancies on the client side.
