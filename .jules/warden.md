## 2023-10-25 — PII Leak in Audit Logs
**Data traced:** PII (Emails, Phones, SSNs)
**Exposure found:** Plaintext details logged in AuditTrail
**Fix:** Irreversible redaction retaining legitimate functional context
**Coverage confirmed:** Audit logs in memory
**Still exposed elsewhere:** none
