## 2025-02-19 — generateAuditHash Delimiter Injection

**Attacked:** `generateAuditHash` function in `src/utils/audit.ts`
**Found:** The hash function concatenates inputs (`previousHash`, `action`, `details`, `author`, `timestamp`) with a `|` delimiter. An attacker can inject `|` into any input field to manipulate the bounds between fields, resulting in the exact same input string being hashed. For example, `action = "CREATE", details = "user|ADMIN"` produces the exact same combined string as `action = "CREATE|user", details = "ADMIN"`. This breaks the integrity of the audit log since different actions yield the same hash.
**Severity:** 🔴
**Fixed or flagged:** Fixed. Using structured serialization (`JSON.stringify`) instead of naive string concatenation eliminates the delimiter injection vulnerability. To maintain backward compatibility and avoid breaking existing validation, the original `generateAuditHash` is preserved, and a new `generateAuditHashV2` is introduced. The V2 hash is then used by the `createAuditLog` function along with a `hashVersion: 2` identifier added to the `AuditTrail` type.
**Systemic pattern:** Look for naive string concatenations in security-sensitive boundaries like cryptography, signature generation, and audit logging.
