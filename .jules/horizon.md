## 2024-06-26 — CI and Build Pipeline Modernization
**Risk identified:** The project used an outdated `.github/workflows/webpack.yml` pointing to Webpack, running Node 18, and omitting modern setup steps for Vite, React 19, and Node 20+. The build would fail, causing significant deployment risks and confusion.
**Migration target:** Modern standard build workflow utilizing `vite build`, `esbuild` for Node/Express, and Node native testing via `tsx`.
**Migrated this session:** Removed legacy `webpack.yml` and replaced it with `build.yml` executing `npm run lint`, `npm run build`, and `npm test` on modern Node versions (20.x, 22.x). Created proper `src/App.tsx`, `server.ts` with conditionally started Express.js, and tests validating endpoints with `supertest`.
**Remaining:** No immediate items remaining for the build pipeline, although broader component restructuring for the UI might be needed in future sessions.
**Next session:** Investigate potential legacy state-management patterns or data-fetching approaches (e.g. migrating to React 19 hooks or sophisticated client caching).
