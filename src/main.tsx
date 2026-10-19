import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { setupAgentAuditBridge } from './utils/agentAuditBridge.ts';
import { AuditTrail } from './types.ts';
import { eventBus } from './utils/events.ts';

// Initialize global audit logs state for the bridge
// As per memory, we must wire this up in a valid entry point even if components are disconnected.
let globalAuditLogs: AuditTrail[] = [];
setupAgentAuditBridge(
  () => globalAuditLogs,
  (newLogs) => {
    globalAuditLogs = newLogs;
    // Emit an event that the UI could listen to (loose coupling).
    eventBus.emit('audit.updated', newLogs);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
