## 2026-06-19 — Delimiter Injection in Audit Logger
**Attacked:** `generateAuditHash` function in `src/utils/audit.ts`
**Found:** Delimiter injection allowed different logical audit inputs (e.g., `action|with` + `details` vs `action` + `with|details`) to produce identical hashes due to naive string concatenation with `|`
**Severity:** 🔴
**Fixed or flagged:** Fixed by replacing string concatenation with safe array serialization using `JSON.stringify`
**Systemic pattern:** Look for manual string-building or delimited formats when computing hashes across the system (e.g., caching keys, signatures).

## 2026-06-19 — Audit Log Concurrency Race Condition (Read-Modify-Write Drift)
**Attacked:** `createAuditLog` function in `src/utils/audit.ts`
**Found:** The `createAuditLog` function relies on passing an array of logs and inspecting the last one to calculate the previous hash. Concurrent calls to `createAuditLog` (e.g., from an event bridge or multiple fast actions) before React state or the array is updated will both receive the same `previousHash`, leading to branching chains / lost logs instead of a single linear, verified audit chain.
**Severity:** 🔴
**Fixed or flagged:** Flagged for human review. Implementing Optimistic Concurrency Control (OCC) requires architectural changes, as all call sites must be updated to enforce `expectedParentHash` and resolve conflicts.
**Systemic pattern:** Read-modify-write drifts may exist in ledger updates, quota increments, or caching logic anywhere multiple sources could concurrently edit the same array/object in state or database.
