import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { eventBus } from './events.js';
import { setupAgentAuditBridge, getGlobalAuditTrail, resetGlobalAuditTrail } from './agentAuditBridge.js';
import { AgentLog } from '../types.js';

describe('Agent Audit Bridge', () => {
  beforeEach(() => {
    resetGlobalAuditTrail();
    eventBus.clear();
  });

  it('should ignore non-action logs', () => {
    setupAgentAuditBridge();

    const infoLog: AgentLog = {
      id: 'log-1',
      agent: 'Retrieval',
      message: 'Found 3 documents',
      timestamp: new Date().toISOString(),
      type: 'info'
    };

    eventBus.emit('agent.log', infoLog);

    assert.strictEqual(getGlobalAuditTrail().length, 0);
  });

  it('should create an audit trail for action logs', () => {
    setupAgentAuditBridge();

    const actionLog: AgentLog = {
      id: 'log-2',
      agent: 'Planner',
      message: 'Linked case A to case B',
      timestamp: new Date().toISOString(),
      type: 'action'
    };

    let auditEmitted = false;
    eventBus.on('audit.updated', () => {
      auditEmitted = true;
    });

    eventBus.emit('agent.log', actionLog);

    const trail = getGlobalAuditTrail();
    assert.strictEqual(trail.length, 1);
    assert.strictEqual(trail[0].action, 'AGENT_ACTION');
    assert.strictEqual(trail[0].author, 'System Agent (Planner)');
    assert.strictEqual(trail[0].details, 'Agent: Planner - Linked case A to case B');
    assert.strictEqual(auditEmitted, true);
  });
});
