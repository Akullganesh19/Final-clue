## 2023-10-27 — AgentLog to AuditTrail Bridge
**Systems connected:** Agent System ↔ Audit System
**Intelligence emerged:** Significant actions (success, warn, action) performed by autonomous agents are automatically captured in the immutable audit trail, providing a unified timeline of both human and machine activities without the agents needing to be aware of the audit system.
**Data flows:** AgentLog objects are emitted by the Agent System over a decoupled EventBus. The Bridge listens for these events, filters them by significance, and transforms them into AuditTrail entries using the core `createAuditLog` utility.
**Coupling approach:** Loosely coupled via an EventBus singleton (`src/utils/events.ts`). The Agent System only emits events; it doesn't import the Audit System. The Bridge (`src/utils/agentAuditBridge.ts`) glues them together. Removing the bridge leaves both systems fully functional independently.
**Next connection:** Explore connecting the Case Linkage system with the Notification system to proactively alert investigators when a new high-confidence linkage is detected.
