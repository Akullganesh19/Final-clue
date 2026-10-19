## 2025-02-27 — Delimiter Injection in Audit Hashing
**Attacked:** src/utils/audit.ts -> generateAuditHash
**Found:** Hash collision vulnerability via delimiter injection. String concatenating input parameters with `|` as the delimiter allows a malicious input (e.g. action "CREATE|user", details "admin") to produce the same hash as (action "CREATE", details "user|admin") when serialized to a flat string.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced the `|` delimited string concatenation with `JSON.stringify` on an object of the arguments to ensure proper parameter boundary separation, securely preserving uniqueness in the hash.
**Systemic pattern:** If any other custom hashing, signing, or cache key generation exists utilizing naive delimiter-based concatenation, they are susceptible to this logic bug.
