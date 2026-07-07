## 2024-07-07 — [PII Leakage in Audit Trails]
**Data traced:** Emails, SSNs, Credit Cards, Phone Numbers in audit log details
**Exposure found:** `createAuditLog` hashes and stores details string in plaintext which can contain unredacted PII
**Fix:** Introduced irreversible masking logic using `redactPII` and applied it to details BEFORE storing them or calculating the audit hash
**Coverage confirmed:** Masking logic covers emails, SSNs, credit cards (with separators), phone numbers (with separators), and is correctly invoked in `createAuditLog`.
**Still exposed elsewhere:** Audit logs may still have PII if the redaction regexes don't match certain variations or if logs are passed manually elsewhere bypassing `createAuditLog`.
