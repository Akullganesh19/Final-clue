## 2026-06-21 — Investigator Name PII Leak in Audit Log Default Parameter
**Data traced:** Real person name ("Arjun Som")
**Exposure found:** Hardcoded as the default value for the `author` parameter in `createAuditLog` in `src/utils/audit.ts`. This means if a log is created without explicitly passing an author name, this specific individual's name is recorded in the permanent audit trail hash.
**Fix:** Removed the hardcoded name and replaced it with the generic string "Investigator" to prevent the active exposure of PII.
**Coverage confirmed:** Triggered the file change in `src/utils/audit.ts` and confirmed the hardcoded name is no longer present. Verified via grep that the name "Arjun Som" no longer exists anywhere in the source code.
**Still exposed elsewhere:** Need to investigate further if existing log storage contains historical leaks of this name.
