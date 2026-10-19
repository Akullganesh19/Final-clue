## 2024-06-20 — Event Bridge: Agents to Audit Trail
**Systems connected:** Agent System ↔ Audit System
**Intelligence emerged:** Any time an Agent performs a critical action (type: 'action'), it is automatically and immutably recorded in the Audit system without the agent needing to explicitly call the audit functions. The system now implicitly tracks its own actions securely.
**Data flows:** AgentLog objects flow from the Agents (emitters) via the Event Bus into the SynapseBridge (listener), which converts them into AuditTrail logs and stores them via `createAuditLog`.
**Coupling approach:** Event Bus Pattern. Neither the Agents nor the Audit System know about each other. The SynapseBridge listens to global events and maps between the two domains, allowing either system to be modified independently.
**Next connection:** Errors ↔ Users (Notifying users when they hit known bugs).
