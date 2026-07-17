## 2023-10-27 — Delimiter Injection in Audit Hash
**Attacked:** src/utils/audit.ts generateAuditHash
**Found:** Delimiter injection caused hash collision. Values joined with generic `|` character allowed spoofing of fields (e.g. `login` and `admin|success` vs `login|admin` and `success`).
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced string interpolation and `|` join with `JSON.stringify` to ensure boundary preservation.
**Systemic pattern:** Search for other instances of cryptographic hashes or signatures combined with generic string concatenation.

## 2023-10-27 — Missing Idempotency in Audit Ledger
**Attacked:** src/utils/audit.ts createAuditLog
**Found:** Duplicate actions could be appended to the append-only ledger because there was no idempotency check, allowing for duplicate log items for a single action.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Required an explicit `idempotencyKey` parameter and added a check to verify it doesn't already exist in the ledger before appending.
**Systemic pattern:** Ensure other state mutation pipelines or ledgers enforce idempotency to prevent drift and duplication.
