import { test } from 'node:test';
import * as assert from 'node:assert';
import { setupAuditBridge } from './auditBridge';
import { eventBus } from './eventBus';
import { AgentLog, AuditTrail } from '../types';

test('Audit Bridge Event Handling', () => {
  let logs: AuditTrail[] = [{
    id: 'INITIAL-LOG-001',
    timestamp: new Date().toISOString(),
    action: 'System Start',
    details: 'System initialized',
    author: 'System',
    hash: 'CHK-INITIAL-00000000'
  }];

  const setLogs = (updater: (prevLogs: AuditTrail[]) => AuditTrail[]) => {
    logs = updater(logs);
  };

  const unsubscribe = setupAuditBridge(setLogs);

  const testAgentLog: AgentLog = {
    id: 'LOG-001',
    agent: 'Planner',
    message: 'Generated case resolution plan',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  eventBus.emit('agent.action', testAgentLog);

  assert.strictEqual(logs.length, 2);
  assert.strictEqual(logs[1].action, 'Agent Action: Planner');
  assert.strictEqual(logs[1].details, 'Generated case resolution plan');
  assert.strictEqual(logs[1].author, 'System: Planner Agent');

  unsubscribe();
});
