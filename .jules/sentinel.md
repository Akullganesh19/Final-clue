## 2025-03-05 — Delimiter Injection in Audit Hashing
**Attacked:** `generateAuditHash` and `createAuditLog` string concatenation.
**Found:** Delimiter injection allowed different combinations of (action, details, author) to hash to the exact same string, breaking the audit log's collision resistance.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced manual `|` concatenation with `JSON.stringify([...])` for strict boundary preservation.
**Systemic pattern:** Manual string concatenation used to generate hashes or IDs from user inputs elsewhere.
