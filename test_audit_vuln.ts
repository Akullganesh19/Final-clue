import { generateAuditHash } from './src/utils/audit.ts';

const hash1 = generateAuditHash('PREV', 'CREATE', 'User|Admin', 'Arjun', '2023-01-01');
const hash2 = generateAuditHash('PREV', 'CREATE|User', 'Admin', 'Arjun', '2023-01-01');

console.log("Hash 1:", hash1);
console.log("Hash 2:", hash2);
console.log("Exploitable?", hash1 === hash2);

if (hash1 === hash2) {
  console.error("FAIL: Delimiter vulnerability is still exploitable.");
  process.exit(1);
} else {
  console.log("PASS: Hashes are unique.");
  process.exit(0);
}
