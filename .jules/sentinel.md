## 2023-10-27 — Audit Log Hash Collision via Delimiter Injection
**Attacked:** src/utils/audit.ts -> generateAuditHash
**Found:** Delimiter injection (`|`) allows a malicious actor to craft `action` and `details` payloads that shift field boundaries, producing a hash collision with legitimate audit entries, thus breaking audit chain integrity.
**Severity:** 🔴
**Fixed or flagged:** Fixed by replacing naive string concatenation with secure boundary-preserving `JSON.stringify` serialization.
**Systemic pattern:** Anywhere cryptographic hashes or signatures are built via string concatenation of user-provided fields using generic delimiters (like `|`, `,`, or `:`).

## 2023-10-27 — Audit Log Duplication and Drift
**Attacked:** src/utils/audit.ts -> createAuditLog
**Found:** The `AuditTrail` appending logic had no idempotency guard. If an operation retried due to network failure, or was called twice concurrently, it would append identical duplicate log entries, corrupting the chain.
**Severity:** 🔴
**Fixed or flagged:** Fixed by requiring an explicit `idempotencyKey` on the `AuditTrail` type and validating its uniqueness at runtime before appending, logging a warning if deduplication is triggered.
**Systemic pattern:** Any state mutation pipeline (especially append-only ledgers or queues) lacking a deterministic uniqueness identifier.
