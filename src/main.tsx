import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { setupAuditBridge } from './utils/auditBridge';
import './index.css';

// Initialize the Synapse Cross-System Connection
setupAuditBridge();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="p-4">
      <h1 className="text-2xl font-bold">Final Clue - Cold Case Evidence Triage System</h1>
    </div>
  </StrictMode>,
);
