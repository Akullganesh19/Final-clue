## 2024-07-20 — PII Redaction in Audit Logs
**Data traced:** PII fields (Emails, Phone Numbers, SSNs).
**Exposure found:** PII was logged in plaintext within the `action` and `details` fields of the AuditTrail via `createAuditLog` in `src/utils/audit.ts`.
**Fix:** Introduced a robust `redactPII` function utilizing lookbehind regex patterns to safely and irreversibly mask Emails, Phone Numbers, and SSNs. Intercepted these fields in `createAuditLog` and applied redaction before hashing and logging.
**Coverage confirmed:** Wrote and executed a test (`src/utils/audit.test.ts`) that asserts PII fields provided to `createAuditLog` are irreversibly masked. Manual tests executed in bash script validated the redaction integrity.
**Still exposed elsewhere:** Currently no other exposure was investigated during this session.
