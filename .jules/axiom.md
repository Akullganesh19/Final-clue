## 2024-06-29 — Client-side audit log hashing
**Complexity found:** `generateAuditHash` and chaining `previousHash` in client-side logs.
**Why it existed:** Likely intended to create a tamper-evident audit trail, but client-side hashing provides zero real security since the client controls the code and memory.
**Eliminated:** The entire hashing mechanism (`generateAuditHash`) and the `hash` field from the `AuditTrail` interface.
**Net change:** Removed 10+ lines of code, simplified `createAuditLog` and `AuditTrail` type.
**Next target:** Server-side validation (or similar).
