import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupAgentAuditBridge } from './utils/agentAuditBridge.ts';

// Initialize the event bridge
setupAgentAuditBridge();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);