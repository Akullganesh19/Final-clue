## 2025-07-26 — PII Exposure in Audit Logs
**Data traced:** details and author fields in AuditTrail logs (can contain emails, phone numbers, SSNs, credit cards).
**Exposure found:** Plaintext logs of sensitive data in the `createAuditLog` function. These logs might end up being persisted, exported, or viewed by anyone with access to the audit trail.
**Fix:** Introduced structural regex-based PII redaction in `createAuditLog` for the `details` and `author` fields to mask emails (preserving the first letter and domain), phone numbers, SSNs, and credit card numbers (preserving the last 4 digits).
**Coverage confirmed:** Verified that sensitive values in `details` and `author` passed to `createAuditLog` are correctly redacted before being logged.
**Still exposed elsewhere:** Other areas of the application (e.g. general console.logs, DB insertions) were not checked for PII exposure.
