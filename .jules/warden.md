## 2023-10-25 — Audit Log PII Leakage
**Data traced:** PII (emails, SSNs, credit cards, phone numbers)
**Exposure found:** Plaintext leakage into audit logs via `details` and `action` parameters in `createAuditLog`.
**Fix:** Introduced irreversible `redactPII` function using regex with context-preserving masking and integrated it into `createAuditLog`.
**Coverage confirmed:** Verified the `redactPII` logic correctly masks sensitive data while leaving non-sensitive data and standard IDs untouched.
**Still exposed elsewhere:** None found in the current scope.
