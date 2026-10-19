## 2024-06-26 — Fix PII Leaks in Audit Ledger Logging

**Data traced:** PII (Email, Phone, SSN, Credit Card)
**Exposure found:** `createAuditLog` inside `src/utils/audit.ts` passed action and detail strings directly into the final audit entry and audit hash without any masking, permanently exposing potentially sensitive investigator/case data within the system's ledger and audit trail.
**Fix:** Introduced a `redactPII` utility that uses irreversible regex masking (e.g., preserving useful context such as `j***@gmail.com` or `***-***-4567`) and applied it to `action` and `details` fields BEFORE generating the `hash` and appending the ledger record in `createAuditLog`.
**Coverage confirmed:** `npm test` runs a newly added `src/utils/audit.test.ts` to strictly verify that `redactPII` properly detects and irreversibly masks all four PII categories without overlap or omission.
**Still exposed elsewhere:** This session primarily addressed the structured logging path via the core `createAuditLog` mechanism. Further review is required for unstructured console outputs or API error responses that might still log unredacted payloads directly to standard output.
