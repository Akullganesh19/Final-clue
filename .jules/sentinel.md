## 2024-05-14 — Delimiter injection in audit logs
**Attacked:** src/utils/audit.ts
**Found:** Delimiter injection vulnerability in generateAuditHash using naive string concatenation
**Severity:** 🔴
**Fixed or flagged:** Fixed. Added generateAuditHashV2 using structured serialization (JSON.stringify) and hashVersion schema evolution. V1 retained for legacy compatibility.
**Systemic pattern:** Look for other custom hash implementations using simple string template concatenation instead of structured formats.
