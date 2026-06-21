import { generateAuditHash } from './src/utils/audit';

const hash1 = generateAuditHash('PREV', 'CREATE', 'User|Admin', 'Arjun', '2023-01-01');
const hash2 = generateAuditHash('PREV', 'CREATE|User', 'Admin', 'Arjun', '2023-01-01');

if (hash1 === hash2) {
  console.error("FAIL: Delimiter vulnerability is still exploitable.");
  process.exit(1);
} else {
  console.log("PASS: Hashes are unique.");
  process.exit(0);
}
