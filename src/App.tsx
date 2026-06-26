import React, { useState, useEffect } from 'react';
import { setupAgentAuditBridge } from './utils/agentAuditBridge';
import { AuditTrail } from './types';

export default function App() {
  const [auditLogs, setAuditLogs] = useState<AuditTrail[]>([]);

  useEffect(() => {
    // Pass the state setter function down directly
    const removeBridge = setupAgentAuditBridge(setAuditLogs);

    return () => {
      removeBridge();
    };
  }, []);

  return <div>Final Clue App</div>;
}
