## 2024-05-18 — Audit Trail PII Redaction
**Data traced:** PII (Email, Phone numbers, SSN)
**Exposure found:** Audit logs where `action`, `details`, and `author` fields could contain unredacted PII in plaintext.
**Fix:** Introduced `redactPII` function in `src/utils/audit.ts` to irreversibly mask emails (e.g. j***@email.com), phone numbers, and SSNs before they are written to the audit log or used in the audit hash generation.
**Coverage confirmed:** Verified via a local unit test that `createAuditLog` outputs masked PII for emails, phone numbers, and SSNs.
**Still exposed elsewhere:** Currently only mitigating PII in `audit.ts`. Further review is needed for application logs, error reporting, and third-party integrations if they exist in a more complete backend.
