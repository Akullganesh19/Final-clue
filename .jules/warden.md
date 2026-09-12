## YYYY-MM-DD — Audit Log PII Leak Fix
**Data traced:** PII (Email, SSN, Phone Numbers)
**Exposure found:** `src/utils/audit.ts` - `createAuditLog` logged plaintext details which could contain sensitive PII.
**Fix:** Introduced `redactPII` function to irreversibly mask Emails, SSNs, and Phone Numbers in the logged `details` string while preserving original plaintext for the cryptographic hash generation to maintain audit integrity.
**Coverage confirmed:** Verified via local script (`test_redaction.ts`) that calling `createAuditLog` with a string containing PII results in a redacted log entry.
**Still exposed elsewhere:** Other files have not been fully analyzed for potential PII leaks; focus was on `src/utils/audit.ts`.
