## 2024-06-27 — CI Pipeline Modernization

**Risk identified:** The GitHub Actions workflow (`.github/workflows/webpack.yml`) uses `npx webpack` for building, but the project is actually configured to use Vite and esbuild. This mismatch means the CI pipeline is essentially broken/not building the actual artifacts, and it isn't running tests. Furthermore, the test runner glob pattern requirement needs Node 22.x+ to function properly. Continuing to use Webpack in CI when the project uses Vite leads to configuration drift, false CI successes/failures, and prevents future team members from relying on standard Vite tooling.

**Migration target:** A modern, Vite and esbuild-based CI pipeline using Node's native test runner on Node 22.x+.

**Migrated this session:**
- Replaced the legacy `webpack.yml` workflow with a modern `build.yml` workflow.
- Configured the workflow to run `npm install`, `npm run lint`, `npm run build`, and `npm test` on Node 22.x.
- Updated `package.json` to include the correct test script using Node's native test runner via `tsx` and removed the invalid esbuild target since `server.ts` is temporarily missing.
- Handled the missing `App.tsx` file in `main.tsx` to allow `vite build` to pass cleanly.

**Remaining:**
- The backend `server.ts` file needs to be created when backend logic is required, at which point the esbuild command should be re-added to the build script.
- The `App.tsx` file needs to be created when frontend layout begins, at which point `main.tsx` should be updated to use it again.

**Next session:**
- Implement core backend logic in `server.ts` and add integration tests, then re-enable esbuild in the `build` script.
