## 2024-06-24 — Missing PII Redaction in Audit Logs
**Data traced:** PII (Email, SSN, Credit Card, Phone Number)
**Exposure found:** `createAuditLog` in `src/utils/audit.ts` directly logged unredacted details and used them to generate the audit hash.
**Fix:** Added a `redactPII` function to irreversibly mask sensitive fields in `createAuditLog` before hashing and storing the log.
**Coverage confirmed:** Tested using `npm test` to verify that sensitive fields are successfully masked and correctly logged.
**Still exposed elsewhere:** Currently only fixed at the core logging layer; other components emitting logs directly via console or third-party SDKs have not been audited.
