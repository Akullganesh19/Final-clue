## 2025-03-01 — Delimiter Injection and Missing Idempotency in Audit Logs
**Attacked:** src/utils/audit.ts
**Found:** generateAuditHash was vulnerable to delimiter injection by simple string concatenation (`|`), allowing arbitrary fields to be forged into colliding hashes. createAuditLog lacked idempotency checks, allowing duplicated log entries and ledger drift.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced manual string concatenation with `JSON.stringify` for safe hashing and added an optional `idempotencyKey` parameter that skips duplicate entries.
**Systemic pattern:** Similar issues may exist where strings are concatenated for hashing or where array appends lack idempotency guards across the ledger/audit systems.
