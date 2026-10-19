## 2025-02-14 — Delimiter Injection in Audit Trail Hash
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** The function combined fields using a predictable `|` delimiter (`${previousHash}|${action}|...`). This allowed delimiter injection where a pipe character inside a field value could shift values into subsequent fields, resulting in identical hashes for different inputs. For example, `generateAuditHash('P', 'A|B', 'C', 'D', 'E')` had the exact same hash as `generateAuditHash('P', 'A', 'B|C', 'D', 'E')`.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced the naive template string concatenation with `JSON.stringify([previousHash, action, details, author, timestamp])`, ensuring safe serialization of delimiter characters without shifting. Added a regression test to prevent recurrence.
**Systemic pattern:** Look for any manual string concatenation used for cryptography, hashing, or caching keys, particularly those separated by commas, colons, or pipes.

## 2025-02-14 — Predictable ID Generation in Audit Logs
**Attacked:** `createAuditLog` in `src/utils/audit.ts`
**Found:** ID generation relied on `Date.now()` combined with `Math.random() * 1000`. This approach is neither universally unique nor cryptographically secure, and under high concurrency or retry conditions, identical IDs could be generated, breaking assumptions of uniqueness in the audit log.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced `Math.random()` and `Date.now()` with `crypto.randomUUID()` to guarantee universal uniqueness for every audit entry.
**Systemic pattern:** Search for occurrences of `Math.random()` combined with timestamps for generating IDs, tokens, or cache-busters across the codebase.
