## 2025-02-27 — [PII Leak in Audit Logs]
**Data traced:** PII (Email, Phone, SSN, Credit Card)
**Exposure found:** `src/utils/audit.ts` - `createAuditLog` saves details to `AuditTrail` without redaction.
**Fix:** Added `redactSensitiveData` function in `src/utils/audit.ts` to mask sensitive fields in `details` before logging and hashing.
**Coverage confirmed:** Tested redaction function with various inputs including normal text, emails, phone numbers, and SSNs.
**Still exposed elsewhere:** No other active leaks identified in this session, but further review of data export and third-party APIs is recommended.
