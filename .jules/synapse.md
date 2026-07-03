## 2025-03-05 — Linkage Audit Bridge
**Systems connected:** Case Linkage ↔ Audit Ledger
**Intelligence emerged:** Automated Chain of Custody. The Audit Ledger now natively tracks investigator decisions automatically, ensuring every linkage status change (e.g. from pending to confirmed) is cryptographically signed and logged without requiring the investigator or the linkage UI to invoke the audit trail manually.
**Data flows:** Case Linkage System emits a `linkage.status_changed` event carrying the updated linkage and author information. The Audit Bridge listens to this event and passes the details to the Audit Ledger's `createAuditLog` method.
**Coupling approach:** Event Bridge pattern via `eventBus.ts`. Neither the Case Linkage system nor the Audit Ledger imports each other. A middle layer (`synapse.ts`) wires the two loosely coupled endpoints together.
**Next connection:** System errors ↔ AI Summarizer (to summarize common error clusters for engineers).
