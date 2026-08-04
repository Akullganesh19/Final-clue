## 2026-08-04 — Delimiter Injection in Audit Hash
**Attacked:** src/utils/audit.ts (generateAuditHash)
**Found:** Delimiter injection allowed different payload structures to produce identical hashes (e.g., action 'LOGIN', detail 'SUCCESS|User' collides with action 'LOGIN|SUCCESS', detail 'User').
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced naive string concatenation with JSON.stringify in generateAuditHashV2. Added hashVersion field.
**Systemic pattern:** Search for naive concatenation in any other cryptographic or integrity hashing mechanisms.
