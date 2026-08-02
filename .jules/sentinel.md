## 2024-08-02 — Delimiter Injection in Audit Log Hashes
**Attacked:** src/utils/audit.ts
**Found:** generateAuditHash is vulnerable to delimiter injection because it uses string concatenation with | delimiter.
**Severity:** 🔴
**Fixed or flagged:** Fixed by introducing generateAuditHashV2 using JSON.stringify for structured serialization.
**Systemic pattern:** Look for other custom hash generation or signature functions that concatenate fields with simple string delimiters instead of structural serialization.
