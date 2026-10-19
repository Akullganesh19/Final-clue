## 2023-10-24 — Audit Ledger Vulnerabilities

**Attacked:** Audit ledger hashing and concurrent writes (`src/utils/audit.ts`)
**Found:**
1. Hash forgery via delimiter injection (using `|` concatenation without escaping inputs allows identical hashes for different logical inputs).
2. Race condition during concurrent writes allowing read-modify-write drifts where overlapping operations overwrite or skip states.
**Severity:** 🔴 Exploitable now
**Fixed or flagged:** Hash forgery fixed: Replaced string concatenation with `JSON.stringify` for safe encoding in `generateAuditHash`. Concurrency flagged: The read-modify-write race condition requires an architectural fix (OCC) which cannot be cleanly implemented at the utility level without affecting call-sites or database layers.
**Systemic pattern:** Look for string concatenation used for generating signatures or hashes without proper delimiting or encoding. Also look for any read-modify-write arrays or states without concurrency controls.
