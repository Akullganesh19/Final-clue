## 2025-03-08 — PII Exposure in Audit Log Details
**Data traced:** PII (Email, SSN, Phone number) and plain text values used for cryptographic hashing
**Exposure found:** PII was passed into the `details` field of `createAuditLog` and permanently recorded in plain text in the audit trail without redaction. A hash collision vulnerability existed in `generateAuditHash` due to using a single pipe delimiter string concatenation.
**Fix:** Introduced structural PII redaction (email, SSN, phone using lookbehind bounds) in the logging pipeline *before* the log is hashed and saved, and replaced pipe concatenation with `JSON.stringify` to serialize the payload securely.
**Coverage confirmed:** Tested the `redactPII` function and `createAuditLog` to ensure emails, SSNs, and phone numbers are securely replaced with irreversible redacted strings and that delimiter injection is prevented during hashing.
**Still exposed elsewhere:** Potential leaks to third-party endpoints or through uncontrolled UI renders haven't been fully verified during this session.
