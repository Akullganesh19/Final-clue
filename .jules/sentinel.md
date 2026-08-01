## 2023-10-27 — Delimiter Injection in Audit Log
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** Delimiter injection (`|`) allows creating colliding hashes for different log details and actions.
**Severity:** 🔴
**Fixed or flagged:** Fixed by introducing `generateAuditHashV2` utilizing `JSON.stringify` serialization.
**Systemic pattern:** Search for naive string concatenation for hash/signature generation elsewhere.
