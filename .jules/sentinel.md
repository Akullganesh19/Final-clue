## 2025-03-05 — Audit Trail Hash Collision

**Attacked:** `src/utils/audit.ts` - `generateAuditHash`
**Found:** The `generateAuditHash` function uses simple string concatenation with `|` delimiters: `${previousHash}|${action}|${details}|${author}|${timestamp}`. An attacker can craft `action` or `details` containing `|` characters to shift the delimiter logic and create identical hashes for different underlying data combinations, undermining the integrity of the audit log.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced naive string interpolation with `JSON.stringify` to ensure inputs containing `|` or other special characters are safely escaped and structure is strictly preserved.
**Systemic pattern:** String concatenation used for generating signatures, hashes, or uniquely identifiable composite keys elsewhere in the system.
