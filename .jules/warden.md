## 2026-07-03 — Audit Log PII Leak Fixed
**Data traced:** Email, SSN, Credit Card, Phone numbers
**Exposure found:** `createAuditLog` logged PII from `details` parameter in plaintext directly into the stored logs.
**Fix:** Added `redactPII` layer to irreversibly mask PII using Regex before hashing and storing the log details.
**Coverage confirmed:** Tested regex redaction on varied strings, confirmed email (j***@gmail.com), SSN (***-**-XXXX), Credit Card (****-****-****-XXXX), and Phone (***-***-XXXX) are properly masked without breaking context or incorrectly masking random Unix timestamps.
**Still exposed elsewhere:** PII might still exist in unstructured text within older logs or outside `AuditTrail`, such as case narratives or other databases.
