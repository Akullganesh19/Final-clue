import { test } from 'node:test';
import * as assert from 'node:assert';
import { initializeAuditBridge } from './synapse';
import { eventBus } from './eventBus';
import { AuditTrail, Linkage } from '../types';

test('Synapse Event Bridge Appends to Audit Log on Linkage Status Change', () => {
  let logs: AuditTrail[] = [
    {
      id: 'AUDIT-INIT',
      timestamp: new Date().toISOString(),
      action: 'INIT',
      details: 'System Initialization',
      author: 'System',
      hash: 'CHK-ROOT-GENESIS-CHAIN-STABLE'
    }
  ];

  const getLogs = () => logs;
  const setLogs = (updater: (prev: AuditTrail[]) => AuditTrail[]) => {
    logs = updater(logs);
  };

  initializeAuditBridge(getLogs, setLogs);

  const mockLinkage = {
    id: 'LINK-123',
    investigatorStatus: 'confirmed'
  } as Linkage;

  eventBus.emit('linkage.status_changed', mockLinkage, 'Test Author');

  assert.strictEqual(logs.length, 2, 'Audit log should have 2 entries');
  assert.strictEqual(logs[1].action, 'LINKAGE_STATUS_CHANGED', 'Action should be LINKAGE_STATUS_CHANGED');
  assert.strictEqual(logs[1].details, 'Status changed to confirmed for linkage LINK-123', 'Details should match');
  assert.strictEqual(logs[1].author, 'Test Author', 'Author should match');
  assert.ok(logs[1].hash.startsWith('CHK-'), 'Hash should be valid');
});
