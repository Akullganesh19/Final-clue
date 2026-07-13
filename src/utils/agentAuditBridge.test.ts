import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { eventBus } from './events';
import { setupAgentAuditBridge, getAuditTrail, resetAuditTrailForTest } from './agentAuditBridge';
import { AgentLog } from '../types';

describe('Agent Audit Bridge', () => {
  beforeEach(() => {
    eventBus.clear();
    resetAuditTrailForTest();
    setupAgentAuditBridge();
  });

  it('should create an audit log from an agent action', () => {
    const agentLog: AgentLog = {
      id: 'log-123',
      agent: 'Planner',
      message: 'Created a new plan',
      timestamp: new Date().toISOString(),
      type: 'action'
    };

    eventBus.emit('agent.action', agentLog);

    const updatedTrail = getAuditTrail();

    assert.strictEqual(updatedTrail.length, 1);
    assert.strictEqual(updatedTrail[0].action, 'AGENT_ACTION_PLANNER');
    assert.strictEqual(updatedTrail[0].details, 'Created a new plan');
    assert.strictEqual(updatedTrail[0].author, 'System Agent (Planner)');
    assert.strictEqual(updatedTrail[0].idempotencyKey, 'log-123');
  });

  it('should be idempotent and not duplicate logs for the same agent log id', () => {
    const agentLog: AgentLog = {
      id: 'log-456',
      agent: 'Critic',
      message: 'Found an inconsistency',
      timestamp: new Date().toISOString(),
      type: 'action'
    };

    // First emission
    eventBus.emit('agent.action', agentLog);

    assert.strictEqual(getAuditTrail().length, 1);

    // Second emission with the same ID
    eventBus.emit('agent.action', agentLog);

    assert.strictEqual(getAuditTrail().length, 1);
  });
});
