## 2024-07-13 — Audit Log PII Leakage Fixed

**Data traced:** PII fields (Emails, SSNs, Credit Cards, Phone Numbers).
**Exposure found:** Unredacted sensitive information passed into `action`, `details`, or `author` in `createAuditLog` would be hashed, stored in plaintext, and potentially exported in audit trails.
**Fix:** Created `redactPII` to mask sensitive data structurally *before* they are used to generate the hash and stored in the audit trail. Also updated `generateAuditHash` to safely combine string fields using `JSON.stringify` preventing hash collisions.
**Coverage confirmed:** The `redactPII` correctly intercepts and redacts string content for Emails, SSNs, credit cards, and phone numbers in tests. Validated that `createAuditLog` properly applies redaction before logging and hashing.
**Still exposed elsewhere:** PII might still exist in legacy plain text databases if any exist. Further audit on database schemas and existing logs required to delete legacy PII completely.
