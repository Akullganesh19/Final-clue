## 2024-08-08 — Audit Log PII Redaction
**Data traced:** PII (Emails, SSNs, Credit Cards) within case details and actions
**Exposure found:** Plaintext case narratives containing PII were being written directly to the immutable audit trail (`src/utils/audit.ts`), exposing sensitive data to anyone with audit log access.
**Fix:** Introduced a structural `redactPII` layer at the entry point of `createAuditLog` to irreversibly mask PII before hashing and logging.
**Coverage confirmed:** Verified via unit tests that emails, SSNs, and credit cards are successfully masked in the generated logs.
**Still exposed elsewhere:** Potential frontend components rendering unredacted PII in UI (outside the scope of this backend audit logging fix).
