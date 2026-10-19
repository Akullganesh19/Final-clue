## 2025-05-15 — Delimiter Injection in Audit Trail Hash
**Attacked:** `generateAuditHash` function in `src/utils/audit.ts`
**Found:** The `generateAuditHash` function combines inputs using a simple pipe (`|`) delimiter. This is vulnerable to delimiter injection where an attacker can supply input containing pipes to manipulate the boundary between fields, causing two logically different events to produce the exact same collision hash, bypassing data integrity guarantees.
**Severity:** 🔴
**Fixed or flagged:** Fixed, by replacing the pipe-delimited string concatenation with `JSON.stringify` to ensure strict boundary preservation of arguments before hashing.
**Systemic pattern:** Similar vulnerabilities may exist in other functions that construct hashes, IDs, or signatures by directly concatenating fields with generic delimiters. Look for `combined = ...` or `hash = ...` logic using simple string joins.
