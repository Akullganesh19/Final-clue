## 2026-06-19 — Cross-Case Entity Hotspots
**Product understood as:** A multi-agent case-linkage and evidence-triage system for cold cases.
**Derivation reasoning:** This product has Cases with entities (person, vehicle, location, weapon). Users do case analysis and triage. Therefore users obviously need Cross-Case Entity Hotspots — because seeing which specific people, places, or things repeatedly show up across supposedly unlinked cases is the core of cold case linkage. It doesn't exist because the initial focus was on full case-to-case semantic similarity rather than granular entity aggregation. I'm building it because giving investigators an immediate view of shared entities across the entire database instantly surfaces concrete leads.
**Feature built:** Added `findEntityHotspots` utility and `<EntityHotspots />` dashboard component to aggregate and display entities appearing in multiple cases.
**User impact:** Investigators can now immediately see which people, vehicles, or locations span multiple cases.
**Next logical feature:** Timeline sequence builder to auto-arrange linked cases chronologically.
