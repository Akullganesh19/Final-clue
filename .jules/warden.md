## 2025-03-05 — PII Leak in Audit Trails
**Data traced:** Emails, SSNs, credit cards, and phone numbers.
**Exposure found:** `createAuditLog` in `src/utils/audit.ts` was storing sensitive information in the audit trail `details` array unmodified, logging PII directly.
**Fix:** Introduced a structural `redactPII` function to regex-mask PII (emails, SSNs, credit cards, phone numbers). The redaction is now applied dynamically inside `createAuditLog` before hashes are computed and before items are added to the list, permanently masking PII in the trail.
**Coverage confirmed:** Tested using `node:test` that `redactPII` accurately formats and captures matching PII entities, ignoring non-PII integers like snowflakes. Verified the array item and the `generateAuditHash` properly receive masked details.
**Still exposed elsewhere:** Audit trails currently lack OCC (Optimistic Concurrency Control) for ledger drift prevention, though that poses a different compliance risk unaddressed by PII redaction.
