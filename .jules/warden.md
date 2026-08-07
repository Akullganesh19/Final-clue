## 2025-03-05 — PII Redaction in Audit Log
**Data traced:** PII (emails, SSNs, phone numbers) in audit log details
**Exposure found:** Plaintext PII logged to `details` inside `createAuditLog` due to lack of redaction at the logging layer.
**Fix:** Added strict regex-based irreversible PII redaction (`redactPII`) for `details` before logging.
**Coverage confirmed:** Verified structurally in `createAuditLog` that any provided `details` text will be filtered by `redactPII`.
**Still exposed elsewhere:** Audit logs may still contain free-text investigator notes which could contain sensitive un-patterned data (like names or addresses) that aren't caught by regex masking.
