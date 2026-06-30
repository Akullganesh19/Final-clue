## 2025-02-28 — PII Leaked in Audit Logs
**Data traced:** PII (Emails, SSNs, Phone numbers, Credit Cards)
**Exposure found:** PII was passed through `createAuditLog` action and details and stored unredacted in the audit trail, leaking it to anyone with access to the system logs.
**Fix:** Implemented an irreversible `redactPII` function via regex and integrated it into the `createAuditLog` process. `redactPII` now sanitizes action strings and details BEFORE they are hashed and saved.
**Coverage confirmed:** I added a comprehensive test suite `src/utils/audit.test.ts` to strictly verify all four patterns of redaction (Email, SSN, Phone, Credit Card) are masked correctly. The tests successfully verify that `createAuditLog` receives redacted data.
**Still exposed elsewhere:** There may still be exposures of user data elsewhere like the console or uncaught exceptions, but the core systematic audit-layer leak is closed.
