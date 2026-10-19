## 2025-03-06 — Audit Log Hash Collision
**Attacked:** `generateAuditHash` in `src/utils/audit.ts`
**Found:** Hash collision occurs when data values contain the pipe `|` separator character (e.g., `action='LOGIN', details='SUCCESS|ADMIN'` collides with `action='LOGIN|SUCCESS', details='ADMIN'`).
**Severity:** 🔴
**Fixed or flagged:** Fixed by replacing string interpolation with `JSON.stringify` to guarantee field separation and prevent boundary shifting.
**Systemic pattern:** This boundary-shifting vulnerability could exist anywhere string concatenation is used to create unique keys or hashes without robust escaping or using structurally aware formats (like JSON). Check other caching or signature logic.
