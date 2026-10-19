import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Apply invisible request deduplication and caching globally
import { dedupedFetch } from './utils/apiClient.ts';
window.fetch = dedupedFetch as any;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
