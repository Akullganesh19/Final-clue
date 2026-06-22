## 2026-06-22 — Fixed active PII leak in default audit log author
**Data traced:** Real individual's name ("Arjun Som") acting as a default investigator ID.
**Exposure found:** `src/utils/audit.ts` default parameter. This embedded the PII directly in the blockchain-style `generateAuditHash` permanent chain for any unauthored log.
**Fix:** Changed default author to the generic "Investigator".
**Coverage confirmed:** Triggered `createAuditLog` script directly and confirmed default output is stripped of the name and the resultant hash uses the clean string.
**Still exposed elsewhere:** Currently unknown. Future scanning should target hardcoded values across testing environments.
