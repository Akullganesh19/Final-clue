## 2026-06-21 — Delimiter Injection in Audit Trail Hash
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** Delimiter injection vulnerability. The hash was generated using a string concatenated with `|`. An attacker could inject `|` into any string parameter (e.g., embedding `|` in an action to spoof details or authorship), resulting in identical hashes for semantically different audit log entries.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Replaced manual pipe (`|`) concatenation with `JSON.stringify` on the parameters array, correctly escaping characters and preserving boundary integrity. Regression test added.
**Systemic pattern:** Look for manual string concatenations used as identifiers, cache keys, or cryptographic hashes in loosely typed systems or custom logging layers.
