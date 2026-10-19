import React, { useState } from 'react';
import { AuditVerifier } from './components/AuditVerifier';
import { createAuditLog } from './utils/audit';
import { AuditTrail } from './types';

// Mock initial data setup
const initialLogs: AuditTrail[] = [];
const logs1 = createAuditLog(initialLogs, 'SYSTEM_BOOT', 'Initialized evidence triage system', 'System');
const logs2 = createAuditLog(logs1, 'CASE_OPENED', 'Opened cold case file #4492', 'Investigator (Arjun Som)');
const initialMockLogs = createAuditLog(logs2, 'EVIDENCE_ADDED', 'Uploaded forensics report', 'Investigator (Arjun Som)');

export default function App() {
  const [logs, setLogs] = useState<AuditTrail[]>(initialMockLogs);

  // Helper to artificially corrupt a log to demonstrate the feature
  const handleCorruptLog = () => {
    if (logs.length > 1) {
      const corruptedLogs = [...logs];
      // Tamper with the details of the second log without updating its hash
      corruptedLogs[1] = {
        ...corruptedLogs[1],
        details: 'Tampered: Deleted suspect data'
      };
      setLogs(corruptedLogs);
    }
  };

  const handleAddLog = () => {
    const newLogs = createAuditLog(logs, 'NOTE_ADDED', 'Reviewed primary suspect alibi', 'Investigator (Arjun Som)');
    setLogs(newLogs);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Final Clue System</h1>
          <p className="text-gray-600 mt-2">Cold Case Evidence Triage</p>
        </header>

        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Audit Ledger Simulator</h2>

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleAddLog}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
              Add Valid Log Event
            </button>
            <button
              onClick={handleCorruptLog}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Simulate Attack (Tamper Log)
            </button>
          </div>

          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto border border-gray-200 rounded p-4">
            {logs.map((log, index) => (
              <div key={log.id} className="text-sm p-2 bg-gray-50 rounded border border-gray-100">
                <span className="font-mono text-gray-400 mr-2">[{index}]</span>
                <span className="font-semibold text-gray-700">{log.action}</span>
                <span className="text-gray-600 ml-2">— {log.details}</span>
                <div className="text-xs text-gray-400 mt-1 font-mono truncate">Hash: {log.hash}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <AuditVerifier logs={logs} />
        </section>
      </div>
    </div>
  );
}
