## 2025-03-01 — Audit Log Data Loss via Concurrency (Missing OCC)
**Attacked:** `createAuditLog` in `src/utils/audit.ts`
**Found:** Function did not validate `expectedPreviousHash`, allowing concurrent reads to fork the state and overwrite each other's audit events (lost logs).
**Severity:** 🔴
**Fixed or flagged:** Fixed. Added `expectedPreviousHash` optional parameter which now throws an error if it fails to match the actual previous hash (OCC). Also added regression test.
**Systemic pattern:** Any other ledger or log appending system should enforce OCC to avoid concurrent read-modify-write drifts.

## 2025-03-01 — PII Leakage in Audit Logs
**Attacked:** `createAuditLog` in `src/utils/audit.ts`
**Found:** Function accepted plaintext PII (Email, SSN, Credit Card, Phone numbers) directly into `details` without any sanitization or redaction.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Implemented `redactPII` using regex to sanitize sensitive information prior to appending to the trail. Added regression test.
**Systemic pattern:** Any logging mechanism across the system should scrub PII before persisting data.
