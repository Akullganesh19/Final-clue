## 2025-02-27 — Audit Hash Delimiter Injection and PII Exposure
**Attacked:** `src/utils/audit.ts`
**Found:**
1. `generateAuditHash` concatenated fields using `|` without escaping, allowing a collision via delimiter injection (e.g. `CREATE|user` + `info` vs `CREATE` + `user|info`).
2. `createAuditLog` logged PII (email, SSN, phone, credit card) in plain text, exposing sensitive data to the audit trail.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced manual string concatenation with `JSON.stringify` for serialization in `generateAuditHash`. Added a `redactPII` function to mask sensitive data before generating the hash and creating the log.
**Systemic pattern:** Wherever simple string concatenation is used for hashing or signing, and wherever user input is logged without redaction.
