import test from 'node:test';
import assert from 'node:assert';
import { bridgeAgentToAudit } from './intelligence-bridge.js';
import { AgentLog, AuditTrail } from '../types.js';

test('bridgeAgentToAudit bridges warning agent logs to audit trail', () => {
  const initialAuditLogs: AuditTrail[] = [];
  const agentLog: AgentLog = {
    id: '123',
    agent: 'Critic',
    message: 'Potential bias detected in temporal linkage',
    timestamp: new Date().toISOString(),
    type: 'warn'
  };

  const result = bridgeAgentToAudit(initialAuditLogs, agentLog);

  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].action, 'AI_AGENT_WARN');
  assert.ok(result[0].details.includes('[Critic] Potential bias detected'));
  assert.strictEqual(result[0].author, 'System Context (Critic)');
});

test('bridgeAgentToAudit ignores info and success logs', () => {
  const initialAuditLogs: AuditTrail[] = [];
  const infoLog: AgentLog = {
    id: '124',
    agent: 'Planner',
    message: 'Started new linkage analysis',
    timestamp: new Date().toISOString(),
    type: 'info'
  };

  const result = bridgeAgentToAudit(initialAuditLogs, infoLog);
  assert.strictEqual(result.length, 0);
});
