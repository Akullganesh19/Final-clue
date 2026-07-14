## 2025-03-05 — Idempotency Guard on Audit Logging
**Failure point found:** `createAuditLog` allowed appending duplicate logs without any deduplication logic. In a system driven by append-only event logs, duplicate log generation (due to retry logic or concurrent requests) breaks blockchain-style validity and duplicates state.
**Why it existed:** The initial implementation assumed each call would be strictly unique and synchronized, without expecting transient failures or frontend retries.
**Recovery built:** An idempotency guard. `createAuditLog` now requires an `idempotencyKey`. It checks the existing log stream for this key. If found, it intercepts the mutation, logs a console warning, and seamlessly returns the original immutable array reference to prevent drift.
**Blast radius before:** Any network hiccup causing a user to double-click or a service to retry could corrupt the audit trail with identical duplicated entries, inflating data and destroying log integrity.
**Watch for:** Other mutation endpoints or array appenders (like evidence tagging or case linkage) lacking idempotency checks on retries.
