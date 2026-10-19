## 2024-06-21 — Predictive Case Prefetching
**Product understood as:** Multi-agent case-linkage & evidence-triage system for cold cases.
**Prediction invented:** Predictive Case Prefetching based on modus operandi and location overlap. When an investigator is viewing a specific case, the system anticipates which related case they will want to view next (due to similar attributes indicating a linked case) and silently prefetches it into memory before they even click.
**Data used:** The existing case array fields: specifically `location` and overlapping terms in `moCategories`. We built an endpoint `/api/predict-next-case` that calculates this.
**Impact:** Near-zero perceived loading time for the most common subsequent action (viewing a connected case with similar patterns). If the prediction misses, standard network fetch degradation applies transparently.
**Next opportunity:** Predicting intelligent defaults for new evidence submission forms based on previous investigator entries.