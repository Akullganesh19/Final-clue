## 2025-03-08 — [Audit Log Concurrency Collision Recovery]
**Failure point found:** Audit log creation relied on `Date.now() + Math.random()` for IDs, which is vulnerable to concurrency collisions during high-volume operations, and used a custom synchronous hashing algorithm that is vulnerable to collision.
**Why it existed:** Likely implemented quickly without considering concurrent operations or secure ID generation practices.
**Recovery built:** Implemented `globalThis.crypto.randomUUID()` with graceful degradation to the old pseudo-random ID generator. Built a new asynchronous API (`createAuditLogAsync`, `generateAuditHashAsync`) utilizing the Web Crypto API for secure hashing, again with graceful degradation. Left synchronous path to prevent breaking existing consumers.
**Blast radius before:** Audit logs could be overwritten or corrupted due to ID collisions, destroying the integrity of case evidence. High severity.
**Watch for:** Other areas where `Math.random()` or `Date.now()` are used to generate critical entity IDs.
