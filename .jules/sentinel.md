## 2025-03-05 — Audit Trail Concurrency and Integrity Weaknesses
**Attacked:** `src/utils/audit.ts` (`createAuditLog` and `generateAuditHash`)
**Found:**
1. The append mechanism lacked concurrency control, allowing two concurrent modifications reading the same parent hash to split the ledger chain and override one another (OCC Drift).
2. The Audit IDs used a highly predictable sequence (`Date.now() + Math.random()`), susceptible to spoofing and enumeration.
3. The cryptographic hash used for the audit ledger (`generateAuditHash`) is a custom 32-bit DJB2 implementation, which is trivially collision-prone and does not provide actual security guarantees against a malicious actor modifying the ledger.
**Severity:** 🔴
**Fixed or flagged:** Fixed OCC by requiring `expectedParentHash` as an argument and validating it. Fixed ID generation using `crypto.randomUUID()`. Flagged the 32-bit hash implementation for a human engineer, as safely upgrading it to SHA-256 requires asynchronous APIs that cascade heavily across the application.
**Systemic pattern:** Lack of deterministic state transitions and predictable entropy. Look for `Date.now() + Math.random()` elsewhere in the codebase, and verify if any other "ledgers" or arrays are modified without a version or parent state check.
