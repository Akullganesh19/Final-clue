## 2024-07-24 — PII Redaction in Audit Logs
**Data traced:** Emails, Phone Numbers, SSNs
**Exposure found:** Plaintext ingestion and storing of sensitive data within `createAuditLog` in `src/utils/audit.ts`.
**Fix:** Added structural regular expression-based redaction in `src/utils/audit.ts` to irreversibly mask PII fields (`details`, `action`, `author`) before they are stored and hashed.
**Coverage confirmed:** Tested `createAuditLog` locally to ensure Emails retain first character and domain (e.g. `a***@example.com`), and Phones and SSNs retain their last 4 digits (e.g. `***-***-1234`).
**Still exposed elsewhere:** None found this session.
