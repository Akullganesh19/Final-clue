import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize the Synapse Bridge so the Neural Pathway is globally active.
// Agents emit events on the eventBus, and the Bridge captures them into Audit Trails.
import './utils/synapseBridge';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
