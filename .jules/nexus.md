## 2024-06-19 — Serial Pattern Dossiers (Case Clusters)
**Product understood as:** A multi-agent case-linkage and evidence-triage system for connecting cold cases.
**Derivation reasoning:** This product has Cases and pair-wise Linkages (connections between two cases). Users confirm these pairwise linkages. Therefore they obviously need overarching Serial Dossiers (identifying timelines of 3+ linked cases) — because while investigators confirm pairs, criminals commit series. It doesn't exist because the system is structured around 1-to-1 connections in a graph network, and missed deriving the emergent Connected Components (the macro view).
**Feature built:** Added `buildCaseClusters` graph traversal utility and `CaseSeriesBoard` UI to automatically roll up confirmed 1-to-1 pairwise links into chronologically ordered overarching serial timelines.
**User impact:** Users can now immediately see entire suspect patterns (e.g., a 4-case string over 3 years) rather than manually piecing together individual pairwise alerts.
**Next logical feature:** Generating unified "Suspect Profiles" that summarize the aggregated MO, temporal patterns, and geographic hot-zones of a serial dossier.
