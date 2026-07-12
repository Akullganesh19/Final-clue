## 2024-05-18 — PII Leak in Audit Logs
**Data traced:** Email addresses, phone numbers, and SSNs.
**Exposure found:** The `createAuditLog` function in `src/utils/audit.ts` wrote raw `action` and `details` fields into the `AuditTrail` array, which acts as an event ledger. This would store and expose sensitive user information (like PII in an action description) permanently in plaintext in the system.
**Fix:** Added a `redactPII` function to sanitize emails, phone numbers, and SSNs. This is applied to `action` and `details` *before* the integrity hash is generated and the log is written, ensuring logs are permanently redacted.
**Coverage confirmed:** Ran native `node:test` suite verifying that emails get masked (e.g. `j***@example.com`), and SSN/Phones get replaced with static tags, all while preserving context.
**Still exposed elsewhere:** This review primarily checked the active application code related to audit logs. Other data persistence endpoints (e.g., direct DB queries, other caches or exports if they exist) were not covered and may still retain or leak data.
