## 2024-07-14 — CI Pipeline Modernization
**Risk identified:** EOL Node.js versions (18.x) and deprecated build tooling (`npx webpack`) masking real pipeline failures.
**Migration target:** Modern Vite and Node 20+ CI environments.
**Migrated this session:** Updated `.github/workflows/webpack.yml` to remove Node 18.x and use `npm run build`/`npm run lint` instead of webpack. Created required structural stubs (`server.ts`, `src/App.tsx`).
**Remaining:** Migrate away from potentially unmaintained dependencies if found, enhance CI steps.
**Next session:** Investigate other potential build system improvements.
