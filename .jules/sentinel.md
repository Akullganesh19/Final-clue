## 2024-05-19 — Audit Log Delimiter Injection
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** Delimiter injection vulnerability allowing attackers to forge structurally equivalent hashes by embedding the `|` delimiter within input fields (e.g., action/details).
**Severity:** 🔴
**Fixed or flagged:** Fixed by introducing `generateAuditHashV2` using structured serialization (`JSON.stringify`) and FNV-1a, alongside schema versioning (`hashVersion: 2`) in `createAuditLog`.
**Systemic pattern:** Any hash or signature generation using naive string concatenation with delimiters is vulnerable. Ensure `JSON.stringify` or equivalent structured formatting is used elsewhere.
