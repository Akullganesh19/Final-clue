## YYYY-MM-DD — Redact email addresses in audit logs
**Data traced:** PII (Email Addresses) in the author field of audit logs.
**Exposure found:** Email addresses were being stored and potentially logged in plaintext within the AuditTrail records.
**Fix:** Applied an irreversible masking to the author field within createAuditLog to provide redacted-but-useful output (e.g., j***@email.com). The cryptographic hash generation remains untouched and uses the original unredacted value.
**Coverage confirmed:** Verified the audit.ts source code modifications to ensure the author property is conditionally redacted before being assigned to the AuditTrail log object, while preserving the original input for hashing.
**Still exposed elsewhere:** The Case entities may contain unredacted names and personal identifiers in the narrative or entity lists.
