import { test } from 'node:test';
import * as assert from 'node:assert';
import { setupAuditBridge } from './auditBridge';
import { eventBus } from './eventBus';
import { AuditTrail, AgentLog } from '../types';

test('Audit Bridge ignores non-action events', (t) => {
  let setLogsCalled = false;
  const mockSetLogs = (updater: (prev: AuditTrail[]) => AuditTrail[]) => {
    setLogsCalled = true;
  };

  const cleanup = setupAuditBridge(mockSetLogs);

  const infoLog: AgentLog = {
    id: '1',
    agent: 'Planner',
    message: 'Testing info log',
    timestamp: new Date().toISOString(),
    type: 'info'
  };

  eventBus.emit('agent.action', infoLog);

  assert.strictEqual(setLogsCalled, false, 'setLogs should not be called for info type logs');

  cleanup();
});

test('Audit Bridge processes action events and updates logs', (t) => {
  let newLogs: AuditTrail[] = [];
  const mockSetLogs = (updater: (prev: AuditTrail[]) => AuditTrail[]) => {
    newLogs = updater([]);
  };

  const cleanup = setupAuditBridge(mockSetLogs);

  const actionLog: AgentLog = {
    id: '2',
    agent: 'Evidence',
    message: 'Testing action log',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  eventBus.emit('agent.action', actionLog);

  assert.strictEqual(newLogs.length, 1, 'setLogs should create a new audit log');
  assert.strictEqual(newLogs[0].action, 'Agent Action: Evidence', 'Should format action properly');
  assert.strictEqual(newLogs[0].details, 'Testing action log', 'Should include the message');

  cleanup();
});
