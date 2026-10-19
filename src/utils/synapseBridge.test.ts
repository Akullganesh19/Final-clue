import { eventBus } from './eventBus';
// Avoid importing the singleton `synapseBridgeInstance` which would add a duplicate listener
// So we just import the class for isolated testing
import { SynapseBridge } from './synapseBridge';
import { AgentLog } from '../types';

function runTests() {
  console.log('--- Running SynapseBridge Tests ---');
  let passCount = 0;
  let failCount = 0;

  function assertEqual(actual: any, expected: any, testName: string) {
    if (actual === expected) {
      console.log(`✅ [PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Expected: ${expected}`);
      console.error(`   Actual:   ${actual}`);
      failCount++;
    }
  }

  // 1. Initialize isolated bridge. This uses the class directly to prevent test pollution
  // We pass an empty array to avoid mutating the global store during tests.
  const testStore: any[] = [];
  const bridge = new SynapseBridge(testStore);
  assertEqual(bridge.getAuditLogs().length, 0, 'Initial audit log count should be 0');

  // 2. Emit a non-action log (should be ignored)
  const infoLog: AgentLog = {
    id: '1',
    agent: 'Planner',
    message: 'Planning started',
    timestamp: new Date().toISOString(),
    type: 'info'
  };
  eventBus.emit('agent.log', infoLog);
  assertEqual(bridge.getAuditLogs().length, 0, 'Info log should not create an audit trail');

  // 3. Emit an action log (should create an audit trail)
  const actionLog: AgentLog = {
    id: '2',
    agent: 'Evidence',
    message: 'Linked evidence from Case A to Case B',
    timestamp: new Date().toISOString(),
    type: 'action'
  };
  eventBus.emit('agent.log', actionLog);

  const logs = bridge.getAuditLogs();
  assertEqual(logs.length, 1, 'Action log should create an audit trail');
  if (logs.length > 0) {
    assertEqual(logs[0].action, 'AGENT_ACTION_EVIDENCE', 'Audit log action should match agent');
    assertEqual(logs[0].details, 'Linked evidence from Case A to Case B', 'Audit log details should match agent message');
    assertEqual(logs[0].author, 'System Agent (Evidence)', 'Audit log author should match agent');
  }

  // Summary
  console.log('\n--- Test Summary ---');
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
