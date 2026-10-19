import { createAuditLog, AuditChainConflictError } from './audit.js';

let errors = 0;

try {
  // Setup
  let globalLogs: any[] = [];
  globalLogs = createAuditLog(globalLogs, 'INIT', 'Initialize system');
  const rootHash = globalLogs[globalLogs.length - 1].hash;

  // Simulate two concurrent requests that both read the state before writing
  const dbStateForReq1 = [...globalLogs];
  const dbStateForReq2 = [...globalLogs];

  const req1ExpectedHash = dbStateForReq1.length > 0 ? dbStateForReq1[dbStateForReq1.length - 1].hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const req2ExpectedHash = dbStateForReq2.length > 0 ? dbStateForReq2[dbStateForReq2.length - 1].hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  // Req 1 processes and writes back
  globalLogs = createAuditLog(globalLogs, 'ACTION_1', 'First action', 'System', req1ExpectedHash);

  // Req 2 processes and writes back
  try {
    globalLogs = createAuditLog(globalLogs, 'ACTION_2', 'Second action', 'System', req2ExpectedHash);
    console.error("FAIL: Expected AuditChainConflictError to be thrown!");
    errors++;
  } catch (e) {
    if (e instanceof AuditChainConflictError) {
      console.log("PASS: Caught expected AuditChainConflictError for concurrent modification.");
    } else {
      console.error("FAIL: Caught unexpected error:", e);
      errors++;
    }
  }

  if (globalLogs.length !== 2) {
    console.error("FAIL: Expected final logs length to be 2, but got", globalLogs.length);
    errors++;
  } else {
    console.log("PASS: Final logs length is 2.");
  }

} catch (e) {
  console.error("FAIL: Test threw unexpected error:", e);
  errors++;
}

if (errors > 0) {
  throw new Error("Tests failed with " + errors + " errors");
} else {
  console.log("All tests passed!");
}
