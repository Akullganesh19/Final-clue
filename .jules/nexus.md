## 2024-07-09 — Case Clusters
**Product understood as:** A multi-agent case-linkage & evidence-triage system for cold cases.
**Derivation reasoning:** The product stores individual Cases and pairwise Linkages between them. Users investigate links between two cases. Therefore users obviously need to see macro patterns (clusters) of cases linked together — because serial patterns rarely stop at two cases. It doesn't exist because the system initially focused on pairwise analysis. I'm building it because giving investigators a high-level view of an entire series of connected cases dramatically accelerates their ability to spot systemic MO patterns and serial behavior.
**Feature built:** Added `findCaseClusters` to group connected components of pairwise case linkages into macro `CaseCluster` patterns using graph traversal.
**User impact:** Investigators can now view broad networks of connected cases (clusters) and see common MO categories across an entire suspected series, rather than just comparing case A to case B.
**Next logical feature:** An emergent timeline view for these clusters, mapping out the evolution of an MO across a case series over time.
