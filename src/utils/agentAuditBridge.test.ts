import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { eventBus } from './events';
import {
  initializeAgentAuditBridge,
  setAuditLogsContext,
  getAuditLogsContext
} from './agentAuditBridge';
import { AgentLog } from '../types';

beforeEach(() => {
  eventBus.clear();
  setAuditLogsContext([]);
});

test('Bridge appends significant agent events to audit logs', () => {
  initializeAgentAuditBridge();

  const log: AgentLog = {
    id: 'log-1',
    agent: 'Planner',
    message: 'Generated case resolution plan',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  eventBus.emit('agent.log', log);

  const auditLogs = getAuditLogsContext();
  assert.strictEqual(auditLogs.length, 1);
  assert.strictEqual(auditLogs[0].action, 'AGENT_PLANNER_ACTION');
  assert.strictEqual(auditLogs[0].details, 'Generated case resolution plan');
  assert.strictEqual(auditLogs[0].author, 'System Agent: Planner');
});

test('Bridge ignores info agent events', () => {
  initializeAgentAuditBridge();

  const log: AgentLog = {
    id: 'log-2',
    agent: 'Retrieval',
    message: 'Fetching case details...',
    timestamp: new Date().toISOString(),
    type: 'info'
  };

  eventBus.emit('agent.log', log);

  const auditLogs = getAuditLogsContext();
  assert.strictEqual(auditLogs.length, 0);
});

test('Bridge handles multiple events correctly', () => {
  initializeAgentAuditBridge();

  eventBus.emit('agent.log', {
    id: 'log-3',
    agent: 'Critic',
    message: 'Found inconsistency in timeline',
    timestamp: new Date().toISOString(),
    type: 'warn'
  } as AgentLog);

  eventBus.emit('agent.log', {
    id: 'log-4',
    agent: 'Summarizer',
    message: 'Successfully summarized evidence',
    timestamp: new Date().toISOString(),
    type: 'success'
  } as AgentLog);

  const auditLogs = getAuditLogsContext();
  assert.strictEqual(auditLogs.length, 2);
  assert.strictEqual(auditLogs[0].action, 'AGENT_CRITIC_WARN');
  assert.strictEqual(auditLogs[1].action, 'AGENT_SUMMARIZER_SUCCESS');
});
