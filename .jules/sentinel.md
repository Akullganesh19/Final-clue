## 2025-02-26 — Audit Log Hash and ID Collision Fix
**Attacked:** src/utils/audit.ts
**Found:**
1. Delimiter Injection in `generateAuditHash`: Using pipe (`|`) string concatenation allowed forging identical hashes for different combinations of inputs (e.g. `LOGIN`, `SUCCESS|admin` vs `LOGIN|SUCCESS`, `admin`).
2. Concurrency ID Collision in `createAuditLog`: Using `Date.now()` and a small random number (`Math.random() * 1000`) caused hundreds of colliding IDs when called concurrently.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Used `JSON.stringify` to securely serialize fields instead of pipe delimiter. Used `globalThis.crypto.randomUUID()` to generate collision-resistant IDs. Added regression tests.
**Systemic pattern:** Using weak random combination generation instead of standard cryptographic UUIDs. Using naive string concatenation for signatures instead of arrays or standard serializers.
