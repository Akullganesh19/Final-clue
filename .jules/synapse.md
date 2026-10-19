## 2024-05-15 — Agent Actions ↔ Audit Trail
**Systems connected:** Agent System ↔ Audit System
**Intelligence emerged:** Every agent action is automatically and immutably recorded in the central audit ledger without agents needing to be aware of the audit system.
**Data flows:** Agent System -> Audit System (agent.action event triggers audit log creation)
**Coupling approach:** Event Bus pattern. Agents emit events, Bridge listens and logs.
**Next connection:** User Session ↔ Error Tracking
