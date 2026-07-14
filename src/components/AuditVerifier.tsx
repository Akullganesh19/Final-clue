import React, { useState } from 'react';
import { AuditTrail } from '../types';
import { verifyAuditChain } from '../utils/audit';

interface AuditVerifierProps {
  logs: AuditTrail[];
}

export function AuditVerifier({ logs }: AuditVerifierProps) {
  const [status, setStatus] = useState<'idle' | 'valid' | 'corrupted'>('idle');
  const [corruptedIndex, setCorruptedIndex] = useState<number | undefined>();

  const handleVerify = () => {
    const result = verifyAuditChain(logs);
    if (result.isValid) {
      setStatus('valid');
      setCorruptedIndex(undefined);
    } else {
      setStatus('corrupted');
      setCorruptedIndex(result.corruptedIndex);
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
        <p>No audit logs available to verify.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Audit Chain Integrity</h3>
        <button
          onClick={handleVerify}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Verify Integrity
        </button>
      </div>

      {status === 'idle' && (
        <div className="text-sm text-gray-500">
          Click the button above to mathematically prove the integrity of the audit logs.
        </div>
      )}

      {status === 'valid' && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded text-sm">
          ✅ <strong>Chain Valid:</strong> All {logs.length} audit logs have been cryptographically verified. No tampering detected.
        </div>
      )}

      {status === 'corrupted' && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
          ❌ <strong>Chain Corrupted:</strong> Tampering detected at index {corruptedIndex}. The cryptographic hash does not match the data and previous link in the chain.
        </div>
      )}
    </div>
  );
}
