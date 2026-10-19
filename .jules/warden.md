## 2025-03-24 — Active Exposure in AuditTrail
**Data traced:** details and author fields in AuditTrail
**Exposure found:** Plaintext PII strings stored in Audit Logs in `src/utils/audit.ts`
**Fix:** Added structural regex-based PII redaction to `createAuditLog`
**Coverage confirmed:** Tested redact function on emails, phones, SSNs, and credit cards
**Still exposed elsewhere:** NA
