## 2026-06-23 — Fixed PII leakage in audit logs
**Data traced:** PII (emails, SSNs, phone numbers, credit card numbers)
**Exposure found:** Plaintext inside `details` fields inside AuditTrail logs generated via `createAuditLog`
**Fix:** Created a robust `redactPII` layer integrated into `createAuditLog` before values are stored or hashed.
**Coverage confirmed:** Tested via `src/utils/audit.test.ts` to confirm emails are reduced to `j***@...`, and phones/SSNs/cards are irreversibly masked.
**Still exposed elsewhere:** No other leak points identified in current state.
