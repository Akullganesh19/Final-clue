## 2025-03-08 — PII Exposure in Audit Trail Hashes
**Data traced:** PII (Email, SSN, Phone, Credit Card) inside `action` and `details` fields
**Exposure found:** `createAuditLog` and `generateAuditHash` logged and hashed raw, unredacted user information. Unredacted logs leak sensitive info to audit log viewers, and hashing unredacted data breaks validation if stored logs are later sanitized, creating a governance gap.
**Fix:** Created `redactPII` to structurally mask emails, SSNs, phone numbers, and CCs using RegEx. Modified `createAuditLog` to apply `redactPII` to both `action` and `details` *before* the integrity hash is generated and the log is persisted.
**Coverage confirmed:** Wrote tests confirming regex correctly masks formatting patterns for Emails, SSNs, Phone numbers, and CCs. Verified `createAuditLog` logs redacted content and generates its integrity hash strictly off the redacted fields.
**Still exposed elsewhere:** Currently unknown if PII is submitted raw to the external LLM or if network graphs leak unredacted data in frontend memory. Needs further evaluation.
