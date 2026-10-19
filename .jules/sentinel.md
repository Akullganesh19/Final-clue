## 2026-07-10 — Delimiter Injection Vulnerability in generateAuditHash
**Attacked:** `generateAuditHash` function in `src/utils/audit.ts`
**Found:** Delimiter injection where an attacker could spoof audit trail entries by shifting data between `|` separated fields (e.g., `'prev', 'action|foo', 'details'` producing the same hash as `'prev', 'action', 'foo|details'`).
**Severity:** 🔴 Exploitable now
**Fixed or flagged:** Fixed this session. The manual string interpolation `template string` with `|` was replaced by `JSON.stringify([previousHash, action, details, author, timestamp])` to safely delimit each field. Added a test confirming no hash collision occurs on injected delimiters.
**Systemic pattern:** Look for any other hashing or logging mechanisms using string concatenation (e.g., `|`, `,`, `:`) to combine multiple input fields instead of properly structured serialization like JSON.
