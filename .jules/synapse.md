## 2024-06-25 — Agent Actions to Audit Trail
**Systems connected:** AgentLog ↔ AuditTrail
**Intelligence emerged:** When agents perform important actions (e.g., retrieving data, fetching info), these actions are now seamlessly logged into the cryptographically verifiable AuditTrail, whereas before only human investigator actions were logged. The audit log now tells the full story of both human and AI activity.
**Data flows:** AgentLogs (with type 'action') are emitted on an EventBus and mapped into the AuditTrail format.
**Coupling approach:** Event Bridge pattern using a custom EventBus. The agent system just emits events, and the audit system is injected via a bridging layer. Neither system imports the other.
**Next connection:** Errors ↔ Users (to alert users directly when their cases run into errors)
