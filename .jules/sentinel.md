## 2026-06-27 — [Audit Log Hash Collision]
**Attacked:** src/utils/audit.ts -> generateAuditHash
**Found:** Separator injection. Using `|` to delimit strings `A|B` + `C` produces the same combined string as `A` + `B|C`, causing a hash collision. This allows forging audit logs with identical hashes despite having different logical action/details contents. Additionally, null/undefined logs crashed `createAuditLog`.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Changed string concatenation to `JSON.stringify([previousHash, action, details, author, timestamp])` to properly encode separators and types. Added null check on the logs array. Regression tests added.
**Systemic pattern:** Look for manual string-concatenation-based hashing in other security or cryptographic contexts, such as user signatures or token generation.
