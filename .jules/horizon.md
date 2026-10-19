## 2026-06-22 — CI Webpack to Vite Migration
**Risk identified:** The CI pipeline was configured to run `npx webpack` and use Node 18, but the project uses Vite/esbuild for building and requires Node 20+. This caused CI to fail consistently because webpack isn't installed and Node 18 triggers EBADENGINE for dependencies like `@google/genai` and `@tailwindcss/oxide`.
**Migration target:** Update the CI workflow to execute `npm run build` (which uses Vite and esbuild) and enforce Node 20.x and 22.x compatibility.
**Migrated this session:** Renamed `.github/workflows/webpack.yml` to `.github/workflows/build.yml`, removed Node 18 from the test matrix, and replaced the `npx webpack` command with `npm install`, `npm run lint`, and `npm run build`.
**Remaining:** None for this specific pipeline.
**Next session:** Investigate other potential legacy configurations.
