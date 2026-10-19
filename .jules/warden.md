## 2025-03-05 — Audit Log PII Redaction
**Data traced:** Email, Phone, SSN, Credit Card (PII)
**Exposure found:** Plaintext in append-only audit logs (details field of AuditTrail) created by createAuditLog in src/utils/audit.ts
**Fix:** Applied irreversible regex-based masking to details field during createAuditLog, preserving original unredacted details exclusively for generating the historical cryptographic hash.
**Coverage confirmed:** Verified through unit test (test-audit.ts) that PII like emails are redacted to useful formats (e.g. j***@email.com) and cryptographic hash generation remains stable using unredacted inputs.
**Still exposed elsewhere:** Case narratives and Notes fields might contain free-text PII, requiring similar redaction at input or rendering boundaries.
