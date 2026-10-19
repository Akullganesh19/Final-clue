## 2024-03-01 — Client-Side Hashing

**Complexity found:** A custom bitwise hashing function (`generateAuditHash`) that ran on the frontend to create a blockchain-like hash chain for audit logs.

**Why it existed:** It was likely an attempt to create tamper-proof audit trails for case history and actions by chaining hashes recursively.

**Eliminated:** The entire `generateAuditHash` function in `src/utils/audit.ts` and the `hash` property on the `AuditTrail` type. Client-side hashing provides zero actual security (since a malicious client can simply compute valid hashes for fake data).

**Net change:** -10 lines of complex hashing logic, -1 type property, -1 concept (client-side hash chaining).

**Next target:** Identify if the frontend is doing any other server-side responsibilities (like data linkage confidence scoring) that should be moved or eliminated.
