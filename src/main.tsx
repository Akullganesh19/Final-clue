import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupAgentAuditBridge } from './utils/bridge.ts';

// Initialize the Agent ↔ Audit bridge
setupAgentAuditBridge();

// The Agent System is currently a stub in this repository.
// To demonstrate the bridge working, we periodically emit a simulated
// agent action which will be intercepted and logged by the Audit System.
import { eventBus } from './utils/events.ts';
setInterval(() => {
  eventBus.emit('agent.action', {
    id: `log-${Date.now()}`,
    agent: 'Planner',
    message: 'Periodically checked the case linkage network for new patterns.',
    timestamp: new Date().toISOString(),
    type: 'action'
  });
}, 30000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);