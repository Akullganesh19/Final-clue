## 2026-07-11 — Entity Overlap Engine
**Product understood as:** A multi-agent cold case triage system that links cases by analyzing semantic similarity, MOs, and entities.
**Derivation reasoning:** The product stores rich entity data (persons, vehicles, weapons, locations) for every case but never explicitly cross-references identical entities across different cases to surface hard, factual overlaps. Linking cases by semantic similarity or MO is useful, but an identical vehicle or weapon appearing in two distinct cases is the strongest possible linkage signal and should be explicitly surfaced.
**Feature built:** An entity cross-referencing engine (`findEntityOverlaps`) and an `EntityOverlapDashboard` UI to automatically find and display identical entities (like specific weapons or vehicles) that appear across multiple cases.
**User impact:** Investigators can now immediately see if a specific entity (like a "Red Honda Civic" or "9mm Glock") appears in multiple cold cases, providing immediate, hard leads without manual searching.
**Next logical feature:** Generating a unified timeline or map plotting where and when these overlapping entities appeared to track offender movement.
