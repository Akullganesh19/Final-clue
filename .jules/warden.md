## 2023-10-27 — [PII Leak in Audit Logs Closed]
**Data traced:** PII (Email, SSN, Phone number)
**Exposure found:** `src/utils/audit.ts` where `createAuditLog` logged `details` and `author` containing plaintext PII directly into the `AuditTrail`.
**Fix:** Implemented a structural `redactPII` function to mask sensitive data before generating the hash and storing the log, ensuring irreversible redaction while preserving functional context (e.g., first letter and domain for emails, last 4 digits for SSNs and phones).
**Coverage confirmed:** Tested via `src/utils/audit.test.ts` to ensure fields are redacted correctly before being saved.
**Still exposed elsewhere:** None found this session.
