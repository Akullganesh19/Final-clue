## 2025-03-09 — Audit Log Delimiter Injection (Hash Collision)
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** Naive string concatenation `${previousHash}|${action}|${details}|${author}|${timestamp}` allows delimiter injection, enabling attackers to forge structural equivalences.
**Severity:** 🔴
**Fixed or flagged:** Fixed (Introduced V2). `generateAuditHashV2` added using JSON.stringify for structural serialization. Original function preserved for legacy verification. Not yet integrated into `createAuditLog` pending downstream reader updates (Reader-First Migration).
**Systemic pattern:** Any hash or signature generation using string concatenation with delimiters. Look for `${a}|${b}` patterns.
