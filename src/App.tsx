import React from 'react';
import { createAuditLog } from './utils/audit';
import { ChainOfCustodyVerifier } from './components/ChainOfCustodyVerifier';

function App() {
  // Generate some realistic mock data for the audit trail to prove E2E functionality
  let mockLogs = createAuditLog([], 'SYSTEM_INIT', 'Initialized chain of custody ledger', 'System Admin');
  mockLogs = createAuditLog(mockLogs, 'EVIDENCE_LOGGED', 'Logged bloody footprint at scene', 'Investigator (Arjun Som)');
  mockLogs = createAuditLog(mockLogs, 'EVIDENCE_TRANSFERRED', 'Transferred footprint mold to forensic lab', 'Investigator (Arjun Som)');
  mockLogs = createAuditLog(mockLogs, 'ANALYSIS_COMPLETE', 'DNA profile extracted from mold', 'Forensic Analyst (Dr. Chen)');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center">Final Clue System</h1>
          <p className="text-center text-gray-600 mt-2">Multi-agent case-linkage & evidence-triage</p>
        </header>

        <main>
          <ChainOfCustodyVerifier logs={mockLogs} />
        </main>
      </div>
    </div>
  );
}

export default App;
