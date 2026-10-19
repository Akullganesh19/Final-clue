import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { dedupedFetch } from './utils/apiClient';

// Wire up the new infrastructure globally, ensuring we don't create an infinite loop.
const originalFetch = globalThis.fetch;
globalThis.fetch = ((url: any, init?: any) => {
  // If dedupedFetch itself needs to use fetch, it should use originalFetch.
  // We accomplished this by exposing getNativeFetch() in apiClient internally,
  // but to be absolutely safe against other interceptors, we can just intercept
  // from components and let native fetch do its thing.
  return dedupedFetch(url, init);
}) as typeof fetch;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);