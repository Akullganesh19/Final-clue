## 2025-03-05 — [OCC Drift Vulnerability]
**Attacked:** Audit logging ledger (`createAuditLog`)
**Found:** Read-modify-write drift where concurrent operations fork the audit chain because they fetch the same base state, generating independent hashes, breaking chain linearity.
**Severity:** 🔴
**Fixed or flagged:** Flagged. Fix requires architectural shift to Optimistic Concurrency Control (OCC) by strictly enforcing an expectedParentHash parameter at all call-sites and DB layers.
**Systemic pattern:** All financial/integrity ledgers lacking explicit state versioning or OCC implementation.

## 2025-03-05 — [Insecure Hash Generation]
**Attacked:** Audit hash generation (`generateAuditHash`)
**Found:** Generates cryptographic hashes using a vulnerable bitwise operation converted to a 32-bit integer, making it trivial to collide and forge audit hashes.
**Severity:** 🔴
**Fixed or flagged:** Flagged. Requires migrating sync functions to async to leverage `crypto.subtle.digest('SHA-256')`.
**Systemic pattern:** Custom crypto utility functions masking as secure checksums.

## 2025-03-05 — [Insecure ID Generation]
**Attacked:** Audit logging ledger (`createAuditLog`)
**Found:** Generated IDs using `Date.now() + Math.random()`, making it trivial to predict and highly susceptible to collisions under load.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced with `crypto.randomUUID()` for secure, collision-resistant UUIDv4 generation. Included regression test to verify uniqueness.
**Systemic pattern:** Using `Math.random()` for unique identifiers instead of native Web Crypto API.

## 2025-03-05 — [PII Leakage in Audit Logs]
**Attacked:** Audit logging ledger (`createAuditLog`)
**Found:** Sensitive user data (Emails, SSNs, Credit Cards, Phone Numbers) provided in details field was logged and hashed in plaintext without masking, resulting in PII spillage into permanent logs.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Added `redactPII` to mask matching data before saving and hashing. Included regression test to verify correct masking.
**Systemic pattern:** Lack of centralized input validation/sanitization before logging data at system boundaries.
