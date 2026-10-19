## 2023-10-27 — Audit Trail Manipulation and Concurrent ID Collisions
**Attacked:** `src/utils/audit.ts` (`generateAuditHash` and `createAuditLog`)
**Found:**
1. Delimiter collision in `generateAuditHash` where an attacker could spoof audit trails by passing a payload containing `|` (e.g., `details="B|C"` vs `action="A|B"`), allowing forgery of the hash chain.
2. High probability ID collision in `createAuditLog` under rapid or concurrent access due to weak pseudo-random generation using `Date.now() + Math.random()`.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced the vulnerable template string in `generateAuditHash` with `JSON.stringify` to safely serialize fields, and replaced the weak ID generation with Node's native `crypto.randomUUID()`. Regression tests added in `src/utils/audit.test.ts`.
**Systemic pattern:** Look for weak string concatenation used for hashing/signing across the app. Look for non-cryptographic pseudo-random uniqueness (`Math.random`) for IDs, tokens, or sessions.
