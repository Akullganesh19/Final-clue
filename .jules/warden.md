## 2024-05-18 — PII Logging Exposure Closed
**Data traced:** PII (emails, SSNs, credit cards, phone numbers)
**Exposure found:** `createAuditLog` would store plaintext sensitive details inside the application's audit history hashes.
**Fix:** Introduced irreversible regex-based structural redaction layer `redactPII` and wired it into `createAuditLog` BEFORE details are processed, hashed, and stored.
**Coverage confirmed:** Node-based test suite verifying regex masks while preserving log context. Checked that emails become j***@example.com, SSNs become ***-**-6789.
**Still exposed elsewhere:** Potential frontend state caching of these same inputs depending on App rendering path.
