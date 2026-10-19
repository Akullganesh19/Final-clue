## 2024-03-24 — Node Native Test Runner and CI Setup
**Risk identified:** The project was missing a formal CI workflow and used test scripts or infrastructure not fully aligned with modern Node standard practices, increasing the likelihood of technical debt or test compatibility issues later. Furthermore, without a reverse proxy in Vite config for local dev, frontend-backend communications may become harder to manage.
**Migration target:** Leveraging Node's native test runner (via `tsx --test`), setting up strict GitHub Actions for CI ensuring builds always work on `Node 22.x`, and ensuring `vite.config.ts` effectively proxies to the backend.
**Migrated this session:**
- Updated `package.json` to include `"test": "tsx --test \"src/**/*.test.ts\""` and `"dev": "vite & tsx server.ts"`.
- Set up proxy to `/api` in `vite.config.ts`.
- Created `.github/workflows/build.yml` using `node-version: 22.x`.
**Remaining:** Migrate or rewrite any test suites to utilize the `node:test` API and write new tests since there are currently no test files matching the glob.
**Next session:** Start writing test files in `src/**/*.test.ts` utilizing the `node:test` API, focusing on `src/utils/audit.ts` first.