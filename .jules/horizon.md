## 2025-06-23 — Migrate legacy Webpack CI to Vite/esbuild & drop Node 18
**Risk identified:** The CI configuration was using a legacy Webpack configuration (`.github/workflows/webpack.yml`) even though the project relies on Vite and esbuild. Furthermore, it was running Node 18.x which is unsupported by the current dependencies (`@google/genai` and `@tailwindcss/oxide`) and will fail with `EBADENGINE`.
**Migration target:** Modernization of the CI workflow to run Vite and esbuild build processes (`npm run build`) and the TypeScript CI checks (`npm run lint`), targeting only Node 20.x and 22.x versions.
**Migrated this session:**
- Renamed the workflow file to `.github/workflows/build.yml`.
- Updated the Node version matrix to drop Node 18 and use `20.x` and `22.x`.
- Modified the build steps to run `npm run lint` and `npm run build` instead of `npx webpack`.
- Added missing `.tsx` file and test files to ensure that everything can be properly built, typed, and tested.
**Remaining:** Migrate and review testing frameworks inside CI (currently tests are passing locally, maybe we can run `npm test` inside the CI in future sessions).
**Next session:** Evaluate adding frontend verification tests via Playwright, and enforce the execution of tests within the build pipeline.
