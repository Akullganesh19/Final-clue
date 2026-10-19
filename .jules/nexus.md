## 2024-07-24 — NextActionPredictor
**Product understood as:** A multi-agent case-linkage & evidence-triage system for cold cases.
**Derivation reasoning:** The system already stores actions in an audit log via `createAuditLog`, but it doesn't learn from users' repeated actions. By tracking action transitions (A -> B), the system can logically predict and suggest the most likely next step to the investigator.
**Feature built:** A predictive engine (`NextActionPredictor`) that tracks state transitions to recommend the next likely action based on the audit trail history.
**User impact:** Investigators get intelligent workflow suggestions (e.g., if "VIEW_CASE" usually precedes "LINK_CASE", the app can anticipate the link action), reducing friction in triage.
**Next logical feature:** Generating summary digests of the last N predicted actions to measure investigator efficiency.
