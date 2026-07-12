## 2025-03-01 — Entity Overlap Analysis Dashboard
**Product understood as:** A multi-agent case-linkage and evidence triage system for cold cases that stores detailed case data and entities.
**Derivation reasoning:** We store structured entity data (people, vehicles, locations, weapons) per case, but don't show the most basic insight: when the exact same entity appears across multiple distinct cases. Users (investigators) clearly need an immediate view of entity overlaps to spot connections without having to manually read through case files or rely solely on black-box semantic linkage.
**Feature built:** An automated Entity Overlap Analysis service and UI component that extracts and groups matching entities across the active case portfolio.
**User impact:** Investigators can now instantly see if the same person, vehicle, or weapon is linked to multiple cold cases, providing actionable direct leads.
**Next logical feature:** Automated anomaly detection (e.g., highlighting when a case has an unusually high density of overlapping entities compared to baseline).
