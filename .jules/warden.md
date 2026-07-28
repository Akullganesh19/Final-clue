## 2024-07-28 — Structural PII Redaction in Audit Logs
**Data traced:** details and author fields in createAuditLog
**Exposure found:** PII (emails, phones, SSNs) stored in plaintext objects/arrays in the audit log trail
**Fix:** Implemented structural regex-based PII redaction for details and author fields in createAuditLog, masking emails (except first letter and domain) and phones/SSNs (except last 4 digits).
**Coverage confirmed:** Verified that createAuditLog successfully redacts PII patterns before appending them to the AuditTrail array.
**Still exposed elsewhere:** The unverified stores include UI states or analytics where these logs might be further processed; deletion paths for active UI state are not yet verified.
