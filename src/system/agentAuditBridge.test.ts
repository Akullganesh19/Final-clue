import { test } from 'node:test';
import assert from 'node:assert';
import { eventBus } from '../utils/eventBus';
import { AgentLog } from '../types';
import { setupAgentAuditBridge } from './agentAuditBridge';

// Setup mock fetch
const globalFetch = global.fetch;

test('AgentAuditBridge - action logs trigger POST to /api/audit', async () => {
  let fetchCalledWith: any = null;
  global.fetch = async (url: any, options: any) => {
    fetchCalledWith = { url, options };
    return { ok: true, text: async () => 'ok' } as any;
  };

  // Re-register listener (clearing old ones if any)
  (eventBus as any).listeners = {};
  setupAgentAuditBridge();

  const log: AgentLog = {
    id: 'test-log-1',
    agent: 'Planner',
    message: 'Generated initial investigation plan',
    timestamp: new Date().toISOString(),
    type: 'action'
  };

  eventBus.emit('agent.log', log);

  // Yield to let async fetch run
  await new Promise(resolve => setTimeout(resolve, 10));

  assert.ok(fetchCalledWith, 'fetch should have been called');
  assert.strictEqual(fetchCalledWith.url, '/api/audit');
  assert.strictEqual(fetchCalledWith.options.method, 'POST');

  const body = JSON.parse(fetchCalledWith.options.body);
  assert.strictEqual(body.action, 'AGENT_ACTION_PLANNER');
  assert.strictEqual(body.details, 'Generated initial investigation plan');
  assert.strictEqual(body.author, 'Agent System: Planner');

  // Restore fetch
  global.fetch = globalFetch;
});

test('AgentAuditBridge - info logs do not trigger fetch', async () => {
  let fetchCalled = false;
  global.fetch = async () => {
    fetchCalled = true;
    return { ok: true, text: async () => 'ok' } as any;
  };

  (eventBus as any).listeners = {};
  setupAgentAuditBridge();

  const log: AgentLog = {
    id: 'test-log-2',
    agent: 'Retrieval',
    message: 'Searching database...',
    timestamp: new Date().toISOString(),
    type: 'info'
  };

  eventBus.emit('agent.log', log);

  await new Promise(resolve => setTimeout(resolve, 10));

  assert.strictEqual(fetchCalled, false, 'fetch should not be called for info logs');

  global.fetch = globalFetch;
});
