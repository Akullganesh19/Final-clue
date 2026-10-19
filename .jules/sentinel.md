## 2025-03-09 — Fixed Concurrent Modification Drift in Audit Logs
**Attacked:** `createAuditLog` in `src/utils/audit.ts`
**Found:** Missing OCC allowed race conditions where multiple requests could append logs simultaneously, creating branched hash chains and breaking ledger integrity.
**Severity:** 🔴
**Fixed or flagged:** Fixed by strictly enforcing an `expectedParentHash` parameter before appending a new log.
**Systemic pattern:** Look for other state updates (like `Case` statuses) missing versioning or OCC checks.

## 2025-03-09 — Fixed Predictable IDs and PII Leakage in Audit Logs
**Attacked:** `createAuditLog` in `src/utils/audit.ts`
**Found:** IDs were generated using predictable `Date.now()` + `Math.random()`. Log details accepted unmasked PII (email, SSN, phone, CC).
**Severity:** 🔴
**Fixed or flagged:** Fixed by generating IDs with `crypto.randomUUID()` and applying a `redactPII` regex layer that requires separators to avoid masking Snowflake IDs.
**Systemic pattern:** Inspect all logging mechanisms and data ingress points for predictable ID generation and missing PII scrubbers.

## 2025-03-09 — Vulnerable custom bitwise hashing algorithm
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** Uses a custom, non-cryptographic bitwise algorithm susceptible to collisions and intentional manipulation.
**Severity:** 🔴
**Fixed or flagged:** Flagged. Requires an additive migration to async `globalThis.crypto.subtle.digest('SHA-256')`, which cannot be done synchronously without breaking existing call sites.
**Systemic pattern:** Ensure no other security-critical functions rely on custom/bitwise math instead of the Web Crypto API.
