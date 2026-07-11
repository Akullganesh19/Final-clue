## 2025-07-11 — Delimiter injection fixed in audit hash generation
**Attacked:** `generateAuditHash` function in `src/utils/audit.ts` where auditing logs hash values are generated
**Found:** Delimiter injection vulnerability existed due to naive string concatenation with `|` delimiters, allowing malicious inputs with `|` characters to produce identical hashes for semantically different data.
**Severity:** 🔴
**Fixed or flagged:** Fixed by replacing manual string concatenation with `JSON.stringify([previousHash, action, details, author, timestamp])`. This ensures data boundaries are preserved and safely escaped.
**Systemic pattern:** Watch for manual string concatenation used for generating composite hashes across different fields, which may introduce collision vulnerabilities.
