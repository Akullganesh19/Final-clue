import React, { useState, useEffect } from 'react';
import { setupAgentAuditBridge } from './utils/agentAuditBridge';
import { eventBus } from './utils/eventBus';
import { AuditTrail, AgentLog } from './types';

function App() {
  const [auditLogs, setAuditLogs] = useState<AuditTrail[]>([]);

  useEffect(() => {
    // Setup the bridge when the app mounts
    const unsubscribe = setupAgentAuditBridge(setAuditLogs);

    // Clean up on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const triggerAgentAction = () => {
    const action: AgentLog = {
      id: Math.random().toString(36).substr(2, 9),
      agent: 'Planner',
      message: 'User triggered manual agent plan via UI',
      type: 'action',
      timestamp: new Date().toISOString()
    };
    eventBus.emit('agent.action', action);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Final Clue - Triage System</h1>
      <button
        onClick={triggerAgentAction}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Trigger Agent Action
      </button>

      <div>
        <h2 className="text-xl font-semibold">Audit Ledger:</h2>
        <ul className="mt-2 border rounded p-2">
          {auditLogs.length === 0 ? <li className="text-gray-500">No logs yet.</li> : null}
          {auditLogs.map(log => (
            <li key={log.id} className="border-b py-2 text-sm font-mono">
              <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="text-blue-600 font-bold ml-2">{log.action}</span>
              <span className="ml-2">{log.details}</span>
              <span className="text-xs text-gray-400 block break-all">Hash: {log.hash}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
