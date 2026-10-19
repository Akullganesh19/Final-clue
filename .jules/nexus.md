## 2025-05-18 — Macro Pattern Clustering
**Product understood as:** A multi-agent cold case system for triaging evidence and linking related cases intelligently.
**Derivation reasoning:** The product has `Case` and `Linkage` data, showing pointwise connections between two cases. But when many cases link together, they form a serial pattern. "Data Without Insight" - We store pairwise links but never show users the macro serial patterns derived from those links.
**Feature built:** Added `CaseCluster` and `detectClusters` using graph traversal (BFS) to group connected cases into serial patterns and automatically extract their common Modus Operandi (MO) categories.
**User impact:** Investigators can now instantly see overarching serial killer macro-patterns instead of just individual case-to-case matches.
**Next logical feature:** A visual timeline or map plotting an entire `CaseCluster`'s progression over time and geography to predict the next strike.