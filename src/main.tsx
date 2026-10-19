import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { interceptFetch } from './utils/requestCoalescer.ts';

// Initialize the global fetch interceptor to enable request coalescing
interceptFetch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
