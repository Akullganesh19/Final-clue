import { agentLogger } from '../src/utils/agentLogger';
import { initializeSynapseConnections, getSynapseAuditTrail, resetSynapseAuditTrail } from '../src/utils/synapse';
import assert from 'assert';

function runTests() {
  console.log("Running Synapse Intelligence tests...");

  // Setup
  resetSynapseAuditTrail();
  initializeSynapseConnections();

  // Test 1: Info log shouldn't trigger audit
  agentLogger.log('Planner', 'Formulated a new plan to review cold case 101', 'info');

  let auditTrail = getSynapseAuditTrail();
  assert.strictEqual(auditTrail.length, 0, "Info log should not be in audit trail");

  // Test 2: Action log should trigger audit
  agentLogger.log('Evidence', 'Classified blood spatter image as high relevance', 'action');

  auditTrail = getSynapseAuditTrail();
  assert.strictEqual(auditTrail.length, 1, "Action log should be in audit trail");
  assert.strictEqual(auditTrail[0].action, 'Evidence Action', "Audit action title should match");
  assert.strictEqual(auditTrail[0].details, 'Classified blood spatter image as high relevance', "Audit details should match");
  assert.strictEqual(auditTrail[0].author, 'System Agent: Evidence', "Audit author should be the system agent");

  console.log("All Synapse tests passed! 🧠");
}

runTests();
