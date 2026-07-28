## 2024-05-15 — Concurrency Collision Missing in Audit Logs
**Failure point found:** `createAuditLog` used naive `Date.now() + Math.random()` for unique IDs, leading to potential concurrency collisions under high load when multiple logs are created in the same millisecond.
**Why it existed:** Likely implemented quickly without considering high-throughput scenarios or concurrent user actions.
**Recovery built:** Upgraded ID generation to use `globalThis.crypto.randomUUID()` with a fallback to the legacy method for graceful degradation.
**Blast radius before:** Audit log corruption, potential database errors if IDs were expected to be unique constraints.
**Watch for:** Other areas of the application generating IDs naively.
