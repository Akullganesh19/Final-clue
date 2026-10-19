## 2024-07-26 — Cryptographic collision and weak UUIDs in audit logs
**Attacked:** src/utils/audit.ts
**Found:** Delimiter injection vulnerability in `generateAuditHash` allows an attacker to generate the same hash for different events (e.g. `LOGIN`, `user|admin` produces same hash as `LOGIN|user`, `admin`). Also, `createAuditLog` uses `Date.now() + Math.random()` which is vulnerable to concurrency collisions if generated at the exact same millisecond.
**Severity:** 🔴
**Fixed or flagged:** Fixed
**Systemic pattern:** Hand-rolled pseudo-random generation and string concatenation for hashes. Look for other places where `Math.random()` or `.join('|')` / template strings are used for cryptographic or identity boundaries.
