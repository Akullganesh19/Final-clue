import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { findCaseClusters } from './utils/clustering.ts';

// 🌌 Nexus Emergent Feature Initialization
// Due to boilerplate limitations, exposing the clustering feature to the window
// object so investigators can access macro pattern analysis end-to-end.
if (typeof window !== 'undefined') {
  (window as any).findCaseClusters = findCaseClusters;
  console.log('🌌 Nexus Feature: Macro pattern analysis loaded. Use window.findCaseClusters(cases, linkages)');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);