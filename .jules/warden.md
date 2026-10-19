## 2023-10-24 — PII Leak in Audit Logger
**Data traced:** Emails, Phone Numbers, Social Security Numbers (SSNs), Credit Card Numbers.
**Exposure found:** PII was passed through the `details` string directly to `createAuditLog` without redaction and permanently appended to the immutable audit trail hash chain.
**Fix:** Introduced the `redactPII` function using regex matching to irreversibly replace sensitive fields with masked values (e.g., `j***@email.com`, `***-**-1234`) while preserving context. The redaction is applied to `details` before the audit hash is computed and the entry is stored.
**Coverage confirmed:** Tested using native Node.js testing module executing regex matching on standard input representations, confirming the output replaces the sensitive items as expected.
**Still exposed elsewhere:** Current changes rely entirely on `createAuditLog` call-sites appropriately formatting strings before hand-off. The implementation protects audit trails structurally, assuming the strings are formatted conventionally.
