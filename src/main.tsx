import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupNetworkOptimizer } from './utils/network.ts';

// Initialize Phantom infrastructure immediately
setupNetworkOptimizer();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
