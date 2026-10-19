import { useState } from 'react';
import { createAuditLog } from './utils/audit';
import { predictor } from './utils/NextActionPredictor';
import type { AuditTrail } from './types';

export default function App() {
  const [logs, setLogs] = useState<AuditTrail[]>([]);
  const [prediction, setPrediction] = useState<string | null>(null);

  const handleAction = (action: string) => {
    const newLogs = createAuditLog(logs, action, "User triggered action", "Investigator");
    setLogs(newLogs);
    setPrediction(predictor.predict());
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Final Clue - Action Prediction</h1>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => handleAction('VIEW_CASE')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Case
        </button>
        <button
          onClick={() => handleAction('LINK_CASE')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Link Case
        </button>
        <button
          onClick={() => handleAction('ADD_EVIDENCE')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Add Evidence
        </button>
      </div>

      <div className="mb-8 p-4 bg-white shadow rounded border-l-4 border-indigo-500">
        <h2 className="text-lg font-semibold text-gray-700">Intelligent Workflow Suggestion</h2>
        <p className="text-xl mt-2">
          {prediction ? (
            <span className="text-indigo-600 font-bold">Suggested Next Action: {prediction}</span>
          ) : (
            <span className="text-gray-400">Perform more actions to get suggestions...</span>
          )}
        </p>
      </div>

      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
        <ul className="space-y-2">
          {logs.map(log => (
            <li key={log.id} className="text-sm font-mono text-gray-600 border-b pb-2">
              [{new Date(log.timestamp).toLocaleTimeString()}] {log.action} - Hash: {log.hash}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
