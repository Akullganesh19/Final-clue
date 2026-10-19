## 2024-05-18 — PII Leak in Audit Trails
**Data traced:** Phone Numbers (PII)
**Exposure found:** Logged in plaintext within the `details` field of the `AuditTrail` in `src/utils/audit.ts`, which would be exposed in any audit logs, exports, or downstream systems processing these logs. The cryptographic hash was also being generated over the unredacted phone number.
**Fix:** Added regex-based redaction at the source inside `createAuditLog`. The redaction uses V8 lookbehinds to safely match phone numbers without capturing and removing surrounding characters. `generateAuditHash` is now also called with the redacted details, preventing the hash from indirectly confirming PII.
**Coverage confirmed:** Wrote and verified `node:test` assertions in `src/utils/audit.test.ts` to confirm phone numbers in various formats are replaced with `[REDACTED]`, while non-PII numerical strings are preserved.
**Still exposed elsewhere:** No other PII leaks (e.g. emails, SSNs) were found in the codebase. Cryptographic delimiter collision vulnerability in `generateAuditHash` remains, as fixing it falls outside the strictly PII-focused scope of this task.
