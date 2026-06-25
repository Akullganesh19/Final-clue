## 2025-06-25 — PII Leakage in Audit Logs
**Data traced:** PII (Email, Credit Card, SSN, Phone number)
**Exposure found:** `createAuditLog` in `src/utils/audit.ts` logged action, details, and author parameters without redacting potential sensitive data fields.
**Fix:** Created `redactPII` function to irreversibly mask PII and integrated it into `createAuditLog` fields (`action`, `details`, `author`).
**Coverage confirmed:** Created `src/utils/audit.test.ts` to assert emails, CCs, SSNs, and Phone numbers are successfully and correctly masked without impacting the remaining context.
**Still exposed elsewhere:** Other areas not yet investigated for logging gaps.
