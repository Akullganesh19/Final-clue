## 2024-07-25 — PII Leakage in Audit Trail
**Data traced:** Email, SSN, Phone Numbers (PII)
**Exposure found:** Plaintext arrays stored by `createAuditLog` inside `logs` argument (`details` and `author` fields), and hashed into blockchain records.
**Fix:** Structural regex-based PII redaction inside `createAuditLog` prior to hash generation and object creation.
**Coverage confirmed:** Tested regex redaction logic for Email, SSN, and Phone numbers on `action`, `details`, and `author` fields.
**Still exposed elsewhere:** No other active console logs or raw network leaks found in current audit trace, but we must verify external systems that ingest these logs.
