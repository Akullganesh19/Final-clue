## 2024-05-20 — Audit Delimiter Injection Vulnerability
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** Delimiter injection (`|`) allows creating an identical audit hash for entirely different events if a user controls input that gets string-concatenated, meaning log integrity can be forged.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Implemented safe serialization via `JSON.stringify` array formatting to securely combine fields instead of relying on weak delimiter formatting.
**Systemic pattern:** Anywhere string concatenation with hardcoded delimiters is used for integrity hashing. Ensure structured serialization is strictly followed.

## 2024-05-20 — Audit PII Exposure Vulnerability
**Attacked:** `createAuditLog` in `src/utils/audit.ts`
**Found:** Sensitive data (SSN, Email, Credit Cards, Phone numbers) leaks completely unredacted into the audit log if present in the `details` field.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Added a robust `redactPII` function applied to the `details` field before log creation or hashing to mask sensitive information irreversibly while preserving context.
**Systemic pattern:** Data leaving the trust boundary (like logs, webhooks) must always pass through a redaction layer.

## 2024-05-20 — Weak Hash Generation Algorithm
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** The algorithm is a weak custom 32-bit bitwise hash (similar to Java's `String.hashCode()`) instead of a cryptographically secure hash. It is trivial to create collisions. Memory specifies Web Crypto API should be used.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Migrated to `crypto.subtle.digest('SHA-256')` using the async Web Crypto API.
**Systemic pattern:** Custom bitwise hashing shouldn't be used for anything requiring security or integrity.

## 2024-05-20 — Concurrency Audit Log Race Condition (OCC missing)
**Attacked:** `createAuditLog` in `src/utils/audit.ts`
**Found:** It reads the last log from the array to get the previous hash: `const lastLog = logs[logs.length - 1];`. This is a classic read-modify-write race condition. If two processes/threads add a log at the exact same millisecond, they both use the same parent hash, branching the chain and destroying integrity. Memory explicitly states "implement Optimistic Concurrency Control (OCC) by passing and validating an expected parent hash".
**Severity:** 🔴
**Fixed or flagged:** Flagged. Requires an architectural change to pass expected parent state through the API/database layer, cannot be fixed just by changing this utility function in isolation. Left for human architectural review (or Ledger agent).
**Systemic pattern:** Anywhere an array/list is appended to based on its current length/tail.
