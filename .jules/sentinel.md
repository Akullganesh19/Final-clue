## 2025-03-09 — [Audit Hash Delimiter Injection Fixed]
**Attacked:** `generateAuditHash` function in `src/utils/audit.ts`
**Found:** The audit log hashing mechanism was vulnerable to delimiter injection. It used simple string concatenation with pipe `|` characters. By shifting pipe characters between parameters (e.g., action `A|B` and details `C` vs action `A` and details `B|C`), an attacker could craft different audit log entries that resolve to the same collision hash, bypassing log integrity checks.
**Severity:** 🔴
**Fixed or flagged:** Fixed. I updated `generateAuditHash` to use `JSON.stringify` serialization, which preserves argument boundaries securely. I added a regression test to ensure different structured parameters with similar raw string shapes produce different hashes.
**Systemic pattern:** Watch for naive string concatenation with known separators (like `|` or `,`) when building cache keys, signatures, or cryptographic hashes anywhere else in the application. Always use `JSON.stringify` or another explicit structured serialization mechanism.
