## 2025-03-09 — Delimiter Injection in Audit Log
**Attacked:** generateAuditHash string concatenation logic
**Found:** Hash collisions due to delimiter injection. `action: "A|B", details: "C"` yields the same string `"A|B|C"` as `action: "A", details: "B|C"`, generating identical hashes.
**Severity:** 🔴
**Fixed or flagged:** Fixed, by introducing `generateAuditHashV2` using `JSON.stringify` and integrating it as a new schema version.
**Systemic pattern:** Anywhere multiple string fields are concatenated for hashing or signature generation without strict structure.
