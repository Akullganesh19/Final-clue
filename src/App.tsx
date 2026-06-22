import React, { useState } from 'react';
import { agentLogger } from './utils/agentLogger';
import { AuditTrail } from './types';

const App: React.FC = () => {
  const [logs, setLogs] = useState<AuditTrail[]>([]);

  const triggerAgentAction = () => {
    // 1. Agent System does something
    agentLogger.logAction('Planner', 'Generated structural linkage hypothesis for matching M.O. signatures.');
  };

  const fetchAuditLogs = async () => {
    try {
       const res = await fetch('/api/audit');
       if (res.ok) {
         setLogs(await res.json());
       }
    } catch (e) {
       console.error("Failed to fetch logs", e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Final Clue - Cold Case Evidence Triage System</h1>
      <p className="text-gray-600 max-w-lg text-center">
        The Agent System now implicitly feeds the Cryptographic Audit Trail without either knowing about each other, using the Synapse Bridge.
      </p>

      <div className="space-x-4">
        <button
          onClick={triggerAgentAction}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
        >
          Simulate Agent Action
        </button>

        <button
          onClick={fetchAuditLogs}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow"
        >
          View Server Audit Trail
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mt-8 p-4 bg-white shadow rounded w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Cryptographic Audit Ledger</h2>
          <ul className="space-y-3">
            {logs.map((log) => (
              <li key={log.id} className="text-sm font-mono bg-gray-50 p-3 rounded border border-gray-200">
                <div><span className="text-gray-500">Hash:</span> {log.hash}</div>
                <div><span className="text-gray-500">Action:</span> {log.action}</div>
                <div><span className="text-gray-500">Author:</span> {log.author}</div>
                <div className="text-gray-700 mt-1">{log.details}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
