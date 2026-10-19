## 2025-03-09 — Agent Action to Audit Trail Bridge
**Systems connected:** Agent System ↔ Audit System
**Intelligence emerged:** Agent actions are now automatically immutably logged to the AuditTrail, providing full accountability without agents needing to know the Audit system exists.
**Data flows:** Agent logs (AgentLog) flow from the Agent System (via EventBus) to the Audit System, where they are transformed into signed AuditTrails.
**Coupling approach:** Event Bridge Pattern. The Agent System emits events via `eventBus`, and the bridge (`agentAuditBridge`) listens. Neither system imports the other.
**Next connection:** Correlate user search behavior with retrieved evidence signals.
