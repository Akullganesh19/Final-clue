## 2024-05-18 — PII exposed in audit trail logging
**Data traced:** PII data (emails, credit cards, SSNs, phone numbers)
**Exposure found:** Plaintext logging of PII in the audit trail `createAuditLog` which appending unredacted text into `logs`.
**Fix:** Added `redactPII` function to mask emails, phone numbers, SSNs, and credit cards before hashing and appending new audit trail objects.
**Coverage confirmed:** The new function `redactPII` removes PII data before creating a new `AuditLog` in `src/utils/audit.ts`
**Still exposed elsewhere:** It is unknown if any PII has leaked elsewhere prior to applying this fix, and whether there are other similar exposure paths that haven't been found.
