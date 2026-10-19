## 2026-06-28 — Agent-to-Audit Ledger Bridge
**Systems connected:** Agent System ↔ Audit Ledger
**Intelligence emerged:** Ephemeral agent reasoning and actions are now cryptographically secured and historically preserved, turning invisible internal agent state into a robust, tamper-evident timeline of AI investigation.
**Data flows:** `AgentLog` objects flow from any Agent via the `EventBus` into the `setupAgentAuditBridge`, which then invokes the React state updater to append them to the `AuditTrail`.
**Coupling approach:** Event Bus and state-updater callback wrapper. The Agent system merely emits events on the global bus. The Bridge independently listens to those events and correctly adapts them for the Audit system, which stays functionally separate and pure.
**Next connection:** Auth ↔ Case Analysis to limit information sharing in prompts based on user clearances.
