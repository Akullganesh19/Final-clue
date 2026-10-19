## 2024-06-25 — Audit Trail Concurrency and PII Protection

**Failure point found:** Audit log creation (`createAuditLog`) was susceptible to read-modify-write drifts where concurrent actions could overwrite history without detection. Also, PII was being written into the plain-text ledger.
**Why it existed:** The audit chain lacked an expected state parameter (Optimistic Concurrency Control), implicitly relying on single-threaded linear execution. Masking PII wasn't considered prior to storing in the details field.
**Recovery built:** Implemented `expectedParentHash` in `createAuditLog` to enforce OCC. Appending now fails safely if the state drifted. Added `redactPII` to irreversibly mask sensitive data before hashing/storage. Added robust async non-blocking alternatives using Web Crypto for heavy audit chains.
**Blast radius before:** High probability of audit trail corruption/forking in collaborative investigations; exposure of sensitive participant data directly in the ledger.
**Watch for:** Other stateful arrays or ledgers appending without validating previous state, or logs printing raw unredacted inputs.
