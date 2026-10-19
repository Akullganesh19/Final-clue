## 2026-06-20 — Entity Overlap Analyzer
**Product understood as:** A cold case evidence triage and linkage system that tracks entities (people, vehicles, locations, weapons) across multiple cases.
**Derivation reasoning:** The system already stores detailed entity arrays (person, vehicle, location, weapon) for each case. However, finding connections between cases based on these shared entities currently requires manual cross-referencing. By automatically identifying and displaying entities that appear in more than one case, investigators can instantly spot hidden linkages that might have been overlooked.
**Feature built:** An `EntityOverlapAnalyzer` UI component and `findEntityOverlaps` utility that automatically extracts, categorizes, and displays entities shared across multiple cases.
**User impact:** Investigators can now immediately see which persons, vehicles, locations, or weapons connect different cold cases, saving hours of manual comparison and potentially unlocking new leads.
**Next logical feature:** Generating an interactive node-graph visualization of these entities to show the entire network of connected cases at a glance.
