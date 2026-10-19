import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { globalPredictor } from './utils/ActionPredictor.ts';

// Ensures the singleton is evaluated and available
if (typeof window !== 'undefined') {
  (window as any).predictor = globalPredictor;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);