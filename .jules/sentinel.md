## 2023-10-25 — Audit Hash Delimiter Injection Vulnerability
**Attacked:** generateAuditHash string concatenation in src/utils/audit.ts
**Found:** Delimiter injection via the '|' character allows crafting identical hashes for different inputs (e.g., action="CREATE", details="FILE|admin" vs action="CREATE|FILE", details="admin").
**Severity:** 🔴
**Fixed or flagged:** Fixed. Introduced generateAuditHashV2 using JSON.stringify for structured serialization and integrated it into createAuditLog with hashVersion: 2, preserving the legacy hashing function.
**Systemic pattern:** Any hashing or signing function relying on naive string concatenation with delimiters instead of structured serialization is vulnerable to similar collisions.
