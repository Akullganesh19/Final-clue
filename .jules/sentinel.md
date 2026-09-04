## 2024-05-16 — Audit Log Hash Collision

**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** The `combined` string used pipe `|` characters to delimit properties for hashing. By injecting a pipe character into an adjacent field (e.g., `action: "EDIT_CASE|user1"` and `details: "modified details"` vs `action: "EDIT_CASE"` and `details: "user1|modified details"`), a hash collision occurs because the final concatenated string is identical in both cases. This allows spoofing or forging log entries without altering the audit trail hash.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced the insecure pipe-delimited string concatenation with `JSON.stringify` to guarantee a unique, structured serialization for the hash input that correctly isolates boundaries.
**Systemic pattern:** Look for any other custom hash generation or signature validation functions using simple string concatenation for serialization before hashing.
