## 2025-03-03 — Audit Log PII Leak
**Data traced:** PII (Emails, SSNs, Credit Cards, Phone numbers)
**Exposure found:** `src/utils/audit.ts` logs actions, details, and author names into an `AuditTrail`, which can contain sensitive data that gets passed into the hash and stored in plain text inside `details` and `author`.
**Fix:** Created `redactPII` function using regexes in `src/utils/audit.ts` to irreversibly mask emails, SSNs, credit cards (with separator enforcement), and phone numbers before storing in the audit log or hashing. Also updated `generateAuditHash` to safely stringify and combine inputs according to memory instructions.
**Coverage confirmed:** Wrote and executed unit tests `src/utils/audit.test.ts` to verify the `redactPII` works as expected and is being used by `createAuditLog`.
**Still exposed elsewhere:** N/A (nothing else found within the scope of currently available codebase, though we should be mindful of other places data is stored outside of this system).
