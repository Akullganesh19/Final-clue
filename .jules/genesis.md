## 2024-03-24 — Missing Server and Resiliency

**Failure point found:** There was no Express backend `server.ts` or React component `src/App.tsx` implemented. A critical external data fetch was implicitly failing (because the endpoints didn't exist), representing an unhandled transient failure dependency call.
**Why it existed:** The backend and main application components were simply not written or missing.
**Recovery built:** Created `server.ts` with `withRetry` logic (exponential backoff) wrapping fragile dependency calls. Also created `src/App.tsx` to handle frontend requests and display data.
**Blast radius before:** 100% failure rate; all API requests would have hung or returned 404s, completely halting evidence triage operations.
**Watch for:** Other third-party integrations (e.g., Gemini API) that may lack similar resiliency mechanisms.