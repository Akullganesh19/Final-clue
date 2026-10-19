## 2024-07-27 — Audit Log Integrity Vulnerabilities
**Attacked:** src/utils/audit.ts
**Found:**
1. The custom `generateAuditHash` function suffers from delimiter injection (collision when string inputs contain the `|` delimiter).
2. The `createAuditLog` id generation uses `Date.now() + Math.random()` which collides in tight loops.
**Severity:** 🔴
**Fixed or flagged:** Fixed (closing delimiter injection by using JSON stringification or secure hashing, and replacing naive ID generation with `crypto.randomUUID()`).
**Systemic pattern:** Look for other custom hashing or ID generation logic in the system instead of standard cryptographic / UUID implementations.
