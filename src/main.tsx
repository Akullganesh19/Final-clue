import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSynapseBridge } from './utils/SynapseBridge.ts';
import { AuditTrail } from './types.ts';

const appLogs: AuditTrail[] = [];
initSynapseBridge(appLogs);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
