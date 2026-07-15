import React, { useState } from 'react';
import { AuditTrail } from '../types';
import { verifyAuditTrail, exportAuditTrailToCSV } from '../utils/audit';

interface Props {
  logs: AuditTrail[];
}

export const ChainOfCustodyVerifier: React.FC<Props> = ({ logs }) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleVerify = () => {
    setIsValid(verifyAuditTrail(logs));
  };

  const handleExport = () => {
    const csvContent = exportAuditTrailToCSV(logs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'chain_of_custody_audit.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Cryptographic Chain-of-Custody Verifier</h2>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleVerify}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Verify Ledger Integrity
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Export CSV for Court
        </button>
      </div>

      {isValid !== null && (
        <div className={`p-4 mb-6 rounded ${isValid ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
          <h3 className="font-bold">{isValid ? '✅ Ledger Intact' : '❌ Tampering Detected'}</h3>
          <p>{isValid ? 'Cryptographic hashes match. Chain of custody is verified.' : 'Hash mismatch found. The ledger has been altered.'}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Hash</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">{log.author}</td>
                <td className="px-4 py-3 font-mono text-xs truncate max-w-xs">{log.hash}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No audit logs available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
