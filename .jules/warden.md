## 2024-05-20 — Securing Audit Trail Integrity
**Data traced:** Case entities (person, vehicle, location)
**Exposure found:** Structural gap in `generateAuditHash` via naive string concatenation (`${previousHash}|${action}...`), allowing attackers to forge audit logs through delimiter injection to mask unauthorized access.
**Fix:** Introduced `generateAuditHashV2` using `JSON.stringify` for structured serialization. Preserved legacy hash validation. Integrated V2 into `createAuditLog` and added `hashVersion: 2` to the schema.
**Coverage confirmed:** Verified modifications to `src/utils/audit.ts` and `src/types.ts` applying `JSON.stringify` serialization and schema versioning.
**Still exposed elsewhere:** No field-level access control on Case entities, and no deletion path observed.
