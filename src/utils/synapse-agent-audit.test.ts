import { test } from 'node:test';
import assert from 'node:assert';
import { bridgeAgentLogToAudit } from './synapse-agent-audit.js';
import { AgentLog, AuditTrail } from '../types.js';

test('bridgeAgentLogToAudit creates audit log for action type', () => {
  const currentTrail: AuditTrail[] = [];
  const log: AgentLog = {
    id: '1',
    agent: 'Planner',
    message: 'Linked case A to case B',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  const newTrail = bridgeAgentLogToAudit(log, currentTrail);

  assert.strictEqual(newTrail.length, 1);
  assert.strictEqual(newTrail[0].action, 'AGENT_ACTION: Planner');
  assert.strictEqual(newTrail[0].details, 'Linked case A to case B');
  assert.strictEqual(newTrail[0].author, 'AI: Planner');
});

test('bridgeAgentLogToAudit ignores non-action type', () => {
  const currentTrail: AuditTrail[] = [];
  const log: AgentLog = {
    id: '2',
    agent: 'Retrieval',
    message: 'Found 3 documents',
    timestamp: new Date().toISOString(),
    type: 'info'
  };

  const newTrail = bridgeAgentLogToAudit(log, currentTrail);

  assert.strictEqual(newTrail.length, 0);
  assert.strictEqual(newTrail, currentTrail);
});
