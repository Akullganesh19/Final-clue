## 2024-05-24 — PII exposure in Audit Logs
**Data traced:** Email addresses and Phone numbers (PII)
**Exposure found:** Plaintext leakage in the `action`, `details`, and `author` fields of the AuditTrail logs created by `createAuditLog`.
**Fix:** Added regex-based PII redaction (`redactPII`) utilizing safe lookbehinds for phones and masked formats for emails. The redaction is applied structurally in `createAuditLog` before generating the audit hash or constructing the log object.
**Coverage confirmed:** Verified the updated file and confirmed redaction logic correctly masks values using testing.
**Still exposed elsewhere:** None found in the reviewed scope.
