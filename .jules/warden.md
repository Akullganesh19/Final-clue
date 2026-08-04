## 2024-05-19 — PII Redaction in Audit Logs
**Data traced:** PII including Emails, SSNs, Phone Numbers, Credit Cards
**Exposure found:** Logged in plaintext within `src/utils/audit.ts` via `action` and `details` fields
**Fix:** Added `redactPII` function to mask sensitive information before hashing and saving audit logs.
**Coverage confirmed:** Verified via node:test that created audit logs successfully mask emails, SSNs, and phone numbers in `details`.
**Still exposed elsewhere:** None found this session.
