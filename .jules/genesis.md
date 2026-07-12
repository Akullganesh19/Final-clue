## 2025-03-09 — Audit Ledger Idempotency

**Failure point found:** The `createAuditLog` utility appended records to the audit ledger indiscriminately on every invocation, with no idempotency protection against duplicate writes (e.g., from double-clicks or retried requests).
**Why it existed:** Historically, it assumed the caller would manage state perfectly and never retry an action, relying purely on the append-only nature of the ledger.
**Recovery built:** Added an `idempotencyKey` parameter and guard to `createAuditLog`. If the given key is already found in the ledger's history, it skips the write and returns the exact unmodified state reference, effectively safely deduplicating identical actions.
**Blast radius before:** Any transient network issue causing a caller to retry could result in duplicate ledger entries, bloating the UI and leading to inconsistencies or false reports of repeated actions.
**Watch for:** Other in-memory append-only array operations (such as event logging or notification dispatching) that may still lack deduplication logic.
