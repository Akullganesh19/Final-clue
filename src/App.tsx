import React, { useEffect, useState } from 'react';
import { eventBus } from './utils/eventBus';
import { AgentLog, AuditTrail } from './types';
import { globalAuditStore } from './utils/synapseBridge';

export default function App() {
  const [logs, setLogs] = useState<AuditTrail[]>([]);

  useEffect(() => {
    // When the application starts or an agent runs a process,
    // they emit events instead of interacting directly with the Audit system.
    const startLinkageProcess = () => {
      const log: AgentLog = {
        id: `LOG-${Date.now()}`,
        agent: 'Planner',
        message: 'Initiated case-linkage semantic analysis',
        timestamp: new Date().toISOString(),
        type: 'action' // The bridge specifically listens for 'action' logs to audit
      };

      eventBus.emit('agent.log', log);
      // Force update to show the new global state
      setLogs([...globalAuditStore]);
    };

    // Simulate an agent kicking off immediately after mount for demonstration
    startLinkageProcess();
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans">
      <header className="p-6 border-b border-border-dark flex items-center justify-between">
        <h1 className="text-2xl font-serif text-brand-gold">Final Clue</h1>
        <div className="text-sm text-gray-400">Agent Status: Active</div>
      </header>
      <main className="p-8">
        <p className="mb-4">Multi-agent case-linkage & evidence-triage system.</p>
        <div className="p-4 bg-dark-surface rounded border border-border-subtle mb-4">
          <p className="text-sm font-mono text-gray-300">
            Agents are analyzing the cases in the background. Their critical actions are being routed through the Synapse Bridge and implicitly audited via the blockchain-style log.
          </p>
        </div>

        <h2 className="text-xl font-bold mb-2 text-brand-gold">Global Audit Store</h2>
        <pre className="bg-dark-panel p-4 rounded text-xs overflow-auto border border-border-dark max-h-64">
          {JSON.stringify(logs, null, 2)}
        </pre>
      </main>
    </div>
  );
}
