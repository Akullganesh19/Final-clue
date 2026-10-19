## 2026-06-20 — Active PII Leak in Default Audit Log Author
**Data traced:** Investigator Name / PII
**Exposure found:** Hardcoded default parameter `author: string = "Investigator (Arjun Som)"` in `createAuditLog` (`src/utils/audit.ts`). This leaks a real person's name into every audit log where an explicit author isn't provided.
**Fix:** Removed the personal name from the default argument, replacing it with the generic default `"Investigator"`.
**Coverage confirmed:** Reviewed `src/utils/audit.ts` to ensure the name "Arjun Som" was completely removed. No other occurrences of this specific PII were found in the codebase.
**Still exposed elsewhere:** None found during this session.
