## 2026-06-25 — Audit Trail Optimistic Concurrency Control
**Value type:** Audit Log Chain Hash (cryptographic chain integrity)
**Drift risk found:** Read-modify-write race condition in `createAuditLog` without concurrency checks. Two concurrent updates reading the same `logs` array would both write using the same `previousHash`, causing the ledger chain to branch, losing the first concurrent update, and silently compromising the integrity of the audit trail.
**Fix:** Introduced Optimistic Concurrency Control (OCC) by requiring an optional `expectedPreviousHash` that must match the tip of the ledger before appending, throwing an `OCC Error` on drift.
**Proven by:** Simulated concurrent updates failing to append using an outdated expected parent hash via `src/utils/audit.test.ts`.
**Other balances to check:** Any state updates via the `EventBus` that rely on sequential consistency or modify shared state buffers asynchronously.
