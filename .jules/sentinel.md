## 2025-03-03 — Delimiter Injection in Audit Log Hashing
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** The audit hashing function concatenates strings using the pipe character `|` as a delimiter (`${previousHash}|${action}|${details}|${author}|${timestamp}`). This allows for structural equivalences to be forged (delimiter injection). For example, `action: "CREATE|User", details: "Admin"` produces the exact same hash as `action: "CREATE", details: "User|Admin"`.
**Severity:** 🔴
**Fixed or flagged:** Fixed by preserving the legacy `generateAuditHash` for backward compatibility, and introducing `generateAuditHashV2` which uses `JSON.stringify` for structured serialization. Since no downstream readers/validators are actively consuming `hashVersion` (as verified via grep), I've fully integrated `generateAuditHashV2` and updated the `AuditTrail` schema to include `hashVersion: 2`.
**Systemic pattern:** Watch for naive string concatenation with delimiters anywhere cryptographic or pseudo-cryptographic hashes, signatures, or identifiers are generated from multiple fields. Structured serialization (e.g., `JSON.stringify`) should always be used.
