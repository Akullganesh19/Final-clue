import { useEffect, useState } from 'react';
import { setupAgentAuditBridge } from './utils/agentAuditBridge';
import { eventBus } from './utils/eventBus';
import { AgentLog, AuditTrail } from './types';

export default function App() {
  const [auditLogs, setAuditLogs] = useState<AuditTrail[]>([]);

  useEffect(() => {
    const cleanup = setupAgentAuditBridge(setAuditLogs);
    return cleanup;
  }, []);

  const simulateAgentAction = () => {
    const log: AgentLog = {
      id: `agent-log-${Date.now()}`,
      agent: 'Evidence',
      message: 'Linked matching MO in Case #304',
      timestamp: new Date().toISOString(),
      type: 'action'
    };
    eventBus.emit('agent.log', log);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Final Clue AI Synapse System</h1>

        <div className="mb-8">
          <button
            onClick={simulateAgentAction}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Simulate Agent Action
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Audit Ledger</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {auditLogs.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No audit logs yet. Actions taken by agents will appear here.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-blue-600">{log.action}</div>
                    <div className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-900">{log.details}</div>
                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    <span className="font-semibold text-gray-700">Hash:</span> {log.hash} |
                    <span className="font-semibold text-gray-700 ml-2">Author:</span> {log.author}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
