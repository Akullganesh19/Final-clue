import { dedupedFetch } from './src/utils/apiClient.js';

if (typeof globalThis !== 'undefined') {
  (globalThis as any).originalFetch = globalThis.fetch;
  globalThis.fetch = dedupedFetch as any;
}
