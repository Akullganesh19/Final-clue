## 2026-07-19 — GitHub Actions CI Pipeline Migration
**Risk identified:** The CI pipeline was configured to use `npx webpack` for a project that utilizes Vite and esbuild. Additionally, it included Node 18, which is unsupported. This lag and misconfiguration could cause ongoing build failures and confuse future developers about the project's actual build tooling.
**Migration target:** Modern build pipeline utilizing the correct Vite/esbuild commands (`npm run build`) and supported Node versions (Node 20+).
**Migrated this session:** Updated `.github/workflows/webpack.yml` to remove Node 18 from the test matrix and replace the incorrect `npx webpack` command with `npm run build`.
**Remaining:** The workflow file is still named `webpack.yml`, which might be misleading, but renaming it was avoided as per project constraints. A future session could rename this file to `build.yml` if the restriction is lifted.
**Next session:** Rename the workflow file and verify if any other tools like Prettier or testing libraries (like Vitest) need to be integrated into the CI pipeline.
