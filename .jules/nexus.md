## 2024-10-24 — Serial Pattern Clustering
**Product understood as:** A multi-agent case-linkage & evidence-triage system for cold cases.
**Derivation reasoning:** The product stores cases and pairwise linkages between them. Users investigate linkages, but serial patterns are often larger than pairs. A macro-pattern feature (clusters) naturally emerges from the graph of linkages.
**Feature built:** Added `findCaseClusters` to group pairwise case linkages into serial macro patterns (`CaseCluster`) using graph traversal, finding common MO categories.
**User impact:** Users can now view interconnected clusters of cases (e.g., 3+ cases linked to the same perpetrator) rather than isolated pairwise links.
**Next logical feature:** Integrating cluster visualizations into the frontend network graph to highlight macro patterns visually.
