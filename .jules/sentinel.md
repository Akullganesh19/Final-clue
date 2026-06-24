## 2024-06-24 — PII Exposure in Audit Logs
**Attacked:** Audit log append (`createAuditLog` in `src/utils/audit.ts`)
**Found:** Sensitive PII (emails, SSNs, phone numbers, CCs) passed in log details were stored in plain text and included in the immutable hash chain.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Added irreversible `redactPII` layer before hashing and storage.
**Systemic pattern:** Ensure other logging or export systems in the application use `redactPII`.

## 2024-06-24 — Concurrency Fork in Audit Chain
**Attacked:** Audit log append (`createAuditLog` in `src/utils/audit.ts`)
**Found:** If two asynchronous actions read the same state and generated logs, they created a parallel fork pointing to the same previous hash, breaking the linear ledger integrity.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Implemented Optimistic Concurrency Control (OCC) requiring an expected previous hash.
**Systemic pattern:** Any read-modify-write operation on immutable ledgers needs OCC.
