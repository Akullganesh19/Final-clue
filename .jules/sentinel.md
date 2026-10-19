## 2024-07-15 — Audit log hash collision and idempotency vulnerabilities
**Attacked:** `generateAuditHash` and `createAuditLog` in `src/utils/audit.ts`
**Found:** Delimiter injection allowed creating identical hashes for distinct events. Missing idempotency checks allowed retried requests to duplicate logs. PII phone numbers were unredacted.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced string interpolation with `JSON.stringify` for hashing, enforced an `idempotencyKey` requirement, and added regex to redact phone numbers.
**Systemic pattern:** Similar vulnerability could exist anywhere string concatenation is used for hashing or identity generation. Idempotency checks must be mandated across all actions mutating shared arrays or states.
