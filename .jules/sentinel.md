## 2025-03-05 — Delimiter Injection in Audit Logging
**Attacked:** Audit log hash generation in `src/utils/audit.ts`
**Found:** Hash collision detected via delimiter injection. String interpolation with `|` allowed shifting structure to forge hashes for different inputs (e.g., `PREV|LOGIN|SUCCESS|IP` vs `PREV|LOGIN|SUCCESS|IP`).
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced string concatenation with `JSON.stringify` to guarantee structured serialization without delimiter collision. Added regression test `src/utils/audit.test.ts`.
**Systemic pattern:** Look for manual string concatenation used for hashing, signing, or serialization, particularly with user-controlled input fields.
