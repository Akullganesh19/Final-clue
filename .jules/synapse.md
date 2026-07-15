## 2026-07-15 — Agent System ↔ Audit System
**Systems connected:** Agent System ↔ Audit System
**Intelligence emerged:** Autonomous agent actions are now automatically recorded in the blockchain-style immutable Audit Trail, providing total traceability and accountability for non-human activity within the triage system.
**Data flows:** Agent actions (`AgentLog`) flow from the Agent Event Bus into the local Audit Trail state (`AuditTrail`), appending securely hashed records.
**Coupling approach:** A decoupled `eventBus` is used. The `agentAuditBridge` listens to the event bus and encapsulates its own state, injecting logs via `createAuditLog`. The core logic of the agents and the audit system do not directly reference one another.
**Next connection:** Auth System ↔ Case Retrieval (so users only query cases they have investigator permissions for).
