## 2024-05-18 — PII Leakage in Audit Logs
**Data traced:** PII fields (email, SSN, credit cards, phone numbers)
**Exposure found:** Plaintext leakage in the application's core append-only AuditTrail logs (`action` and `details` fields) stored via `createAuditLog` which persists data to the blockchain-style logs.
**Fix:** Introduced a centralized `redactPII` function in `src/utils/audit.ts` utilizing non-destructive lookbehind regex patterns to safely mask sensitive PII fields (Emails, SSNs, Credit Cards, Phones) before generating the audit hash and persisting the log.
**Coverage confirmed:** Tested the `createAuditLog` method directly to verify PII is redacted correctly from both `action` and `details` fields before storage, without corrupting standard text. Verified execution paths for emails, SSNs, CCs, and phones.
**Still exposed elsewhere:** This redaction is applied specifically at the logging layer via `createAuditLog`. Other systemic exposures (e.g., third-party exports or UI rendering of raw case entities) may still expose PII if not passing through this specific audit layer.
