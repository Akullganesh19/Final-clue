## 2025-06-25 — CI Workflow Modernization
**Risk identified:** Legacy CI build step relied on deprecated Webpack command and outdated Node.js versions (v18, which is no longer supported by key dependencies like `@google/genai` and TailwindCSS oxide). Testing was omitted, leaving a risk for unverified code changes causing future breakages.
**Migration target:** A modern, Vite-compatible CI workflow using Node.js 20.x and 22.x, fully integrated with standard scripts (`npm run lint`, `npm run build`, `npm test`), and dropping unused Node versions.
**Migrated this session:** Renamed `.github/workflows/webpack.yml` to `build.yml`, updated node versions to [20.x, 22.x], replaced the `npx webpack` command with proper `lint`, `build`, and `test` executions, and added the missing `test` script in `package.json` utilizing node's native test runner via `tsx`.
**Remaining:** Migrate and/or configure any further CI checks such as Playwright frontend verification.
**Next session:** Look for outdated or legacy implementations in `vite.config.ts` or add further specific test cases (since tests are currently empty).
