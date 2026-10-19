## 2025-07-05 — PII Leak in Audit Trails
**Data traced:** Email and Phone Number (within event `details`)
**Exposure found:** `createAuditLog` writes unmodified `details` into the `AuditTrail`, leaking PII.
**Fix:** Introduced a `redactPII` utility that intercepts and redacts PII before the log detail is structured and stored.
**Coverage confirmed:** Tested redactPII with email, SSN, Credit Cards and Phone numbers. Added test case for `createAuditLog` proving it filters details appropriately.
**Still exposed elsewhere:** Nothing observed within the scope of audit logging.
