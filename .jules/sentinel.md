## 2026-06-22 — Audit Log Integrity Vulnerability Fixed
**Attacked:** `generateAuditHash` and `createAuditLog` inside `src/utils/audit.ts`
**Found:** Delimiter injection allowed creating collisions in audit log hashes. A malicious user could craft an action string with the pipe (`|`) delimiter and spoof other fields without invalidating the audit chain hash. Additionally, the hash is merely a 32-bit integer DJB2 variant, making collisions trivial to brute force.
**Severity:** 🔴 Exploitable now (for the delimiter injection), 🟡 Latent (for 32-bit hash collision)
**Fixed or flagged:** Fixed the delimiter injection by changing the payload to be serialized via `JSON.stringify` to enforce strict parameter boundaries. Flagged the 32-bit hashing algorithm. It needs to be upgraded to a cryptographic hash (e.g. SHA-256) eventually for real security, but the current fix eliminates the direct spoofing mechanism.
**Systemic pattern:** Look for any manual string concatenation used for integrity checks or signatures.
