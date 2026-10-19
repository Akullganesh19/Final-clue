## 2024-05-24 — Audit Log PII Redaction
**Data traced:** PII (Emails, SSNs, Phone Numbers, Credit Cards) in audit trail details
**Exposure found:** PII in `details` field of `AuditTrail` logged in plaintext by `createAuditLog`
**Fix:** Introduced irreversible `redactPII` function applied to log details before storage, preserving hash integrity
**Coverage confirmed:** Verified via regression test that PII is masked (e.g., `j***@gmail.com`) and hash remains unmutated
**Still exposed elsewhere:** Potential PII in `Case.narrative` or `Case.notes` fields which are not yet scrubbed at the database layer
