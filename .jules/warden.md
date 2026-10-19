## 2023-10-27 — [PII Logging Exposure Closed]
**Data traced:** Emails, SSNs, phone numbers in application logs.
**Exposure found:** Plaintext fields (`details` and `author`) in `createAuditLog` within `src/utils/audit.ts` exposed sensitive values to anyone viewing the audit logs.
**Fix:** Introduced irreversible regex-based structural redaction via `redactPII` for `details` and `author` prior to hashing and storing them in the audit trail.
**Coverage confirmed:** Ran `npx tsx --test src/**/*.test.ts` to confirm emails, SSNs, and phone numbers are correctly redacted while preserving context (e.g. `j***@example.com`, `***-**-6789`).
**Still exposed elsewhere:** Other forms of personal data (e.g., DOB, raw unstructured notes) or exports may still lack redaction, but the primary structured audit log path is now secure.
