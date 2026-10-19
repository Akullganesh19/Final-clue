import { describe, it, afterEach, beforeEach } from 'node:test';
import assert from 'node:assert';
import { eventBus } from './events.js';
import { auditLogs, clearAuditLogs, setupAgentAuditBridge } from './agentAuditBridge.js';
import { AgentLog } from '../types.js';

describe('AgentLog to AuditTrail Bridge', () => {
  beforeEach(() => {
    // Reset state before each test
    clearAuditLogs();
    eventBus.clear();
    // Re-setup the listener since we cleared it
    setupAgentAuditBridge();
  });

  afterEach(() => {
    // Ensure event listeners are cleared to prevent test leakage
    eventBus.clear();
    clearAuditLogs();
  });

  it('should create an audit log when an agent.action event is emitted', () => {
    const mockAgentLog: AgentLog = {
      id: 'log-123',
      agent: 'Planner',
      message: 'Generated execution plan for case linkage',
      timestamp: new Date().toISOString(),
      type: 'action'
    };

    eventBus.emit('agent.action', mockAgentLog);

    assert.strictEqual(auditLogs.length, 1, 'Audit log should be created');

    const createdLog = auditLogs[0];
    assert.strictEqual(createdLog.action, 'AGENT_ACTION_PLANNER', 'Action should match agent name');
    assert.strictEqual(createdLog.details, 'Generated execution plan for case linkage', 'Details should match message');
    assert.strictEqual(createdLog.author, 'System Agent: Planner', 'Author should indicate the system agent');
  });

  it('should not throw if no data is passed (graceful handling)', () => {
    // Emit an event that the bridge isn't listening to, shouldn't affect anything
    eventBus.emit('unrelated.event');
    assert.strictEqual(auditLogs.length, 0, 'No audit log should be created for unrelated events');
  });
});
